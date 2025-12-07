module guestbook::guestbook_test;

use sui::clock;
use std::debug;
use std::string::{Self, String};
use guestbook::guestbook;

#[test]
fun post_message_increments_count_and_stores_text() {
    let mut ctx = tx_context::dummy();
    let mut guestbook = guestbook::create_for_testing(&mut ctx);
    let clock_obj = clock::create_for_testing(&mut ctx);
    let now = clock::timestamp_ms(&clock_obj);
    let tempString : String = string::utf8(b"Clock value!");
    debug::print(&tempString);
    debug::print<u64>(&now);

    let sender = tx_context::sender(&ctx);
    let msg = b"Hello, Sui!";
    

    guestbook::post_message(&mut guestbook, msg, &clock_obj, &mut ctx);

    assert!(guestbook::message_count(&guestbook) == 1, 0);
    let messages = guestbook::messages(&guestbook);
    let first = vector::borrow(messages, 0);
    assert!(guestbook::message_author(first) == sender, 1);
    assert!(vector::length(guestbook::message_text(first)) == vector::length(&msg), 2);
    assert!(guestbook::message_timestamp_ms(first) == now, 3);

    clock::destroy_for_testing(clock_obj);
    guestbook::destroy_for_testing(guestbook);
}

#[test, expected_failure(abort_code = guestbook::ETooLong)]
fun too_long_message_aborts() {
    let mut ctx = tx_context::dummy();
    let mut guestbook = guestbook::create_for_testing(&mut ctx);
    let clock_obj = clock::create_for_testing(&mut ctx);

    let mut text = vector::empty<u8>();
    let mut i = 0;
    while (i < guestbook::max_message_bytes() + 1) {
        vector::push_back(&mut text, 0x41);
        i = i + 1;
    };

    guestbook::post_message(&mut guestbook, text, &clock_obj, &mut ctx);

    clock::destroy_for_testing(clock_obj);
    guestbook::destroy_for_testing(guestbook);
}
