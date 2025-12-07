module guestbook::guestbook;

use sui::clock::{Self, Clock};
use sui::event;

const ETooLong: u64 = 1;
const MAX_MESSAGE_BYTES: u64 = 100;

/// Guestbook holds a list of posted messages.
public struct Guestbook has key {
    id: object::UID,
    messages: vector<Message>,
}

/// One guestbook entry.
public struct Message has copy, drop, store {
    author: address,
    text: vector<u8>,
    timestamp_ms: u64,
}

/// Emitted every time a message is posted.
public struct MessagePosted has copy, drop, store {
    guestbook: address,
    author: address,
    text: vector<u8>,
    timestamp_ms: u64,
}

/// Creates and returns a fresh guestbook (not shared).
public fun create(ctx: &mut tx_context::TxContext): Guestbook {
    Guestbook { id: object::new(ctx), messages: vector::empty<Message>() }
}

/// Entry to create and share a new guestbook object so anyone can post.
#[allow(lint(public_entry))]
public entry fun init_shared(ctx: &mut tx_context::TxContext) {
    let guestbook = create(ctx);
    transfer::share_object(guestbook);
}

/// Post a short message to the shared guestbook.
/// Enforces a byte-length cap and emits an event.
#[allow(lint(public_entry))]
public entry fun post_message(guestbook: &mut Guestbook, text: vector<u8>, clock: &Clock, ctx: &mut tx_context::TxContext) {
    let len = vector::length(&text);
    if (len > MAX_MESSAGE_BYTES) {
        abort ETooLong
    };

    let sender = tx_context::sender(ctx);
    let now = clock::timestamp_ms(clock);

    let text_for_event = clone_bytes(&text);
    vector::push_back(&mut guestbook.messages, Message { author: sender, text, timestamp_ms: now });

    let gb_addr = object::uid_to_address(&guestbook.id);
    let last_idx = vector::length(&guestbook.messages) - 1;
    let last = vector::borrow(&guestbook.messages, last_idx);
    event::emit(MessagePosted { guestbook: gb_addr, author: last.author, text: text_for_event, timestamp_ms: last.timestamp_ms });
}

/// Returns number of messages stored.
public fun message_count(guestbook: &Guestbook): u64 {
    vector::length(&guestbook.messages)
}

/// View helper exposing the messages vector.
public fun messages(guestbook: &Guestbook): &vector<Message> {
    &guestbook.messages
}

/// Message field accessors.
public fun message_author(msg: &Message): address {
    msg.author
}

public fun message_text(msg: &Message): &vector<u8> {
    &msg.text
}

public fun message_timestamp_ms(msg: &Message): u64 {
    msg.timestamp_ms
}

/// Max allowed message length (bytes).
public fun max_message_bytes(): u64 {
    MAX_MESSAGE_BYTES
}

fun clone_bytes(bytes: &vector<u8>): vector<u8> {
    let mut out = vector::empty<u8>();
    let len = vector::length(bytes);
    let mut i = 0;
    while (i < len) {
        let b = *vector::borrow(bytes, i);
        vector::push_back(&mut out, b);
        i = i + 1;
    };
    out
}

#[test_only]
public fun create_for_testing(ctx: &mut tx_context::TxContext): Guestbook {
    create(ctx)
}

#[test_only]
public fun destroy_for_testing(guestbook: Guestbook) {
    let Guestbook { id, messages } = guestbook;
    let mut msgs = messages;
    let mut i = vector::length(&msgs);
    while (i > 0) {
        let _ = vector::pop_back(&mut msgs);
        i = i - 1;
    };
    object::delete(id);
}



