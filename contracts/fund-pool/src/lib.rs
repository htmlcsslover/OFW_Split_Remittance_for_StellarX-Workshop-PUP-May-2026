#![no_std]
//! CareFund Stellar FundPool contract.
//!
//! This contract manages on-chain state for modular social-impact funding.
//! It handles real token transfers via the Stellar Asset Contract (e.g. USDC).

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FundState {
    pub category: Symbol,
    pub balance: i128,
    pub created_by: Address,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PayoutRequest {
    pub fund_id: u32,
    pub requester: Address,
    pub amount: i128,
    pub kind: Symbol,
    pub approved: bool,
    pub paid: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StipendSchedule {
    pub beneficiary: Address,
    pub amount: i128,
    pub interval_days: u32,
    pub active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SolarShare {
    pub shares: i128,
    pub principal: i128,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Asset,
    Fund(u32),
    Contribution(u32, Address),
    Request(u32),
    Stipend(u32),
    SolarShare(u32, Address),
    Verification(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    AlreadyExists = 3,
    NotFound = 4,
    InvalidAmount = 5,
    AlreadyApproved = 6,
    InsufficientBalance = 7,
    FundClosed = 8,
}

#[contract]
pub struct FundPoolContract;

#[contractimpl]
impl FundPoolContract {
    pub fn init(env: Env, admin: Address, asset: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Asset, &asset);
        env.storage().instance().extend_ttl(1000, 5000);
        Ok(())
    }

    pub fn create_fund(
        env: Env,
        fund_id: u32,
        category: Symbol,
        created_by: Address,
    ) -> Result<FundState, Error> {
        Self::require_init(&env)?;
        created_by.require_auth();
        let key = DataKey::Fund(fund_id);
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyExists);
        }

        let fund = FundState {
            category,
            balance: 0,
            created_by,
            active: true,
        };
        env.storage().persistent().set(&key, &fund);
        Ok(fund)
    }

    pub fn contribute(
        env: Env,
        fund_id: u32,
        contributor: Address,
        amount: i128,
    ) -> Result<i128, Error> {
        contributor.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let mut fund = Self::read_fund(&env, fund_id)?;
        if !fund.active {
            return Err(Error::FundClosed);
        }

        // Transfer tokens from contributor to contract
        let asset_addr: Address = env.storage().instance().get(&DataKey::Asset).unwrap();
        let token_client = token::Client::new(&env, &asset_addr);
        token_client.transfer(&contributor, &env.current_contract_address(), &amount);

        fund.balance += amount;
        env.storage()
            .persistent()
            .set(&DataKey::Fund(fund_id), &fund);

        let contribution_key = DataKey::Contribution(fund_id, contributor.clone());
        let previous: i128 = env
            .storage()
            .persistent()
            .get(&contribution_key)
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&contribution_key, &(previous + amount));

        Ok(fund.balance)
    }

    pub fn request_payout(
        env: Env,
        request_id: u32,
        fund_id: u32,
        requester: Address,
        amount: i128,
        kind: Symbol,
    ) -> Result<PayoutRequest, Error> {
        requester.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let fund = Self::read_fund(&env, fund_id)?;
        if !fund.active {
            return Err(Error::FundClosed);
        }

        let key = DataKey::Request(request_id);
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyExists);
        }

        let request = PayoutRequest {
            fund_id,
            requester,
            amount,
            kind,
            approved: false,
            paid: false,
        };
        env.storage().persistent().set(&key, &request);
        Ok(request)
    }

    pub fn approve_payout(
        env: Env,
        request_id: u32,
        approver: Address,
    ) -> Result<PayoutRequest, Error> {
        Self::require_admin(&env, &approver)?;
        let mut request: PayoutRequest = env
            .storage()
            .persistent()
            .get(&DataKey::Request(request_id))
            .ok_or(Error::NotFound)?;

        if request.approved {
            return Err(Error::AlreadyApproved);
        }

        let mut fund = Self::read_fund(&env, request.fund_id)?;
        if fund.balance < request.amount {
            return Err(Error::InsufficientBalance);
        }

        request.approved = true;
        request.paid = true;
        fund.balance -= request.amount;

        env.storage()
            .persistent()
            .set(&DataKey::Request(request_id), &request);
        env.storage()
            .persistent()
            .set(&DataKey::Fund(request.fund_id), &fund);

        // Transfer tokens from contract to requester
        let asset_addr: Address = env.storage().instance().get(&DataKey::Asset).unwrap();
        let token_client = token::Client::new(&env, &asset_addr);
        token_client.transfer(
            &env.current_contract_address(),
            &request.requester,
            &request.amount,
        );

        Ok(request)
    }

    pub fn close_fund(env: Env, fund_id: u32, admin: Address) -> Result<FundState, Error> {
        Self::require_admin(&env, &admin)?;
        let mut fund = Self::read_fund(&env, fund_id)?;
        if !fund.active {
            return Err(Error::FundClosed);
        }

        fund.active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Fund(fund_id), &fund);

        Ok(fund)
    }

    pub fn record_stipend(
        env: Env,
        schedule_id: u32,
        sponsor: Address,
        beneficiary: Address,
        amount: i128,
        interval_days: u32,
    ) -> Result<StipendSchedule, Error> {
        sponsor.require_auth();
        if amount <= 0 || interval_days == 0 {
            return Err(Error::InvalidAmount);
        }

        let schedule = StipendSchedule {
            beneficiary,
            amount,
            interval_days,
            active: true,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Stipend(schedule_id), &schedule);
        Ok(schedule)
    }

    pub fn record_solar_share(
        env: Env,
        fund_id: u32,
        investor: Address,
        shares: i128,
        principal: i128,
    ) -> Result<SolarShare, Error> {
        investor.require_auth();
        Self::read_fund(&env, fund_id)?;
        if shares <= 0 || principal <= 0 {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::SolarShare(fund_id, investor);
        let existing: SolarShare = env.storage().persistent().get(&key).unwrap_or(SolarShare {
            shares: 0,
            principal: 0,
        });
        let share = SolarShare {
            shares: existing.shares + shares,
            principal: existing.principal + principal,
        };
        env.storage().persistent().set(&key, &share);
        Ok(share)
    }

    pub fn set_verification(
        env: Env,
        admin: Address,
        account: Address,
        status: u32,
    ) -> Result<u32, Error> {
        Self::require_admin(&env, &admin)?;
        env.storage()
            .persistent()
            .set(&DataKey::Verification(account), &status);
        Ok(status)
    }

    pub fn get_fund(env: Env, fund_id: u32) -> Result<FundState, Error> {
        Self::read_fund(&env, fund_id)
    }

    pub fn get_contribution(env: Env, fund_id: u32, contributor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(fund_id, contributor))
            .unwrap_or(0)
    }

    pub fn get_request(env: Env, request_id: u32) -> Result<PayoutRequest, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Request(request_id))
            .ok_or(Error::NotFound)
    }

    pub fn get_verification(env: Env, account: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Verification(account))
            .unwrap_or(0)
    }

    fn require_init(env: &Env) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        Ok(())
    }

    fn require_admin(env: &Env, admin: &Address) -> Result<(), Error> {
        Self::require_init(env)?;
        let stored: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if stored != *admin {
            return Err(Error::NotInitialized);
        }
        admin.require_auth();
        Ok(())
    }

    fn read_fund(env: &Env, fund_id: u32) -> Result<FundState, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Fund(fund_id))
            .ok_or(Error::NotFound)
    }
}

mod test;
