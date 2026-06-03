#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{symbol_short, Address, Env};

fn setup(env: &Env) -> (FundPoolContractClient<'_>, Address, Address) {
    env.mock_all_auths();
    let contract_id = env.register(FundPoolContract, ());
    let client = FundPoolContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    let asset = Address::generate(env);
    client.init(&admin, &asset);
    (client, admin, asset)
}

#[test]
fn creates_fund_and_tracks_contribution() {
    let env = Env::default();
    let (client, _, _) = setup(&env);
    let creator = Address::generate(&env);
    let donor = Address::generate(&env);

    let fund = client.create_fund(&1, &symbol_short!("mental"), &creator);
    assert_eq!(fund.balance, 0);

    let balance = client.contribute(&1, &donor, &250);
    assert_eq!(balance, 250);
    assert_eq!(client.get_contribution(&1, &donor), 250);
}

#[test]
fn payout_approval_reduces_balance() {
    let env = Env::default();
    let (client, admin, _) = setup(&env);
    let creator = Address::generate(&env);
    let donor = Address::generate(&env);
    let provider = Address::generate(&env);

    client.create_fund(&2, &symbol_short!("lunch"), &creator);
    client.contribute(&2, &donor, &1000);
    client.request_payout(&9, &2, &provider, &300, &symbol_short!("invoice"));
    let request = client.approve_payout(&9, &admin);

    assert!(request.approved);
    assert_eq!(client.get_fund(&2).balance, 700);
}

#[test]
fn records_stipends_solar_shares_and_verification() {
    let env = Env::default();
    let (client, admin, _) = setup(&env);
    let creator = Address::generate(&env);
    let sponsor = Address::generate(&env);
    let senior = Address::generate(&env);
    let investor = Address::generate(&env);

    client.create_fund(&3, &symbol_short!("solar"), &creator);
    let stipend = client.record_stipend(&11, &sponsor, &senior, &25, &30);
    assert_eq!(stipend.amount, 25);

    let share = client.record_solar_share(&3, &investor, &50, &500);
    assert_eq!(share.shares, 50);

    assert_eq!(client.set_verification(&admin, &senior, &2), 2);
    assert_eq!(client.get_verification(&senior), 2);
}
