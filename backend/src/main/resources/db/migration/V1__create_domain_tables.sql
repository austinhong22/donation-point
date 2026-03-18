create table charity (
    id bigint primary key auto_increment,
    code varchar(50) not null unique,
    name varchar(100) not null,
    description varchar(500) not null,
    active boolean not null,
    created_at timestamp not null default current_timestamp
);

create table app_user (
    id bigint primary key auto_increment,
    email varchar(120) not null unique,
    display_name varchar(100) not null,
    role varchar(30) not null,
    managed_charity_id bigint null,
    active boolean not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_app_user_managed_charity
        foreign key (managed_charity_id) references charity (id)
);

create table partner_product (
    id bigint primary key auto_increment,
    sku varchar(50) not null unique,
    name varchar(100) not null,
    description varchar(500) not null,
    point_cost bigint not null,
    active boolean not null,
    created_at timestamp not null default current_timestamp
);

create table point_account (
    id bigint primary key auto_increment,
    owner_type varchar(30) not null,
    owner_reference_id bigint not null,
    account_type varchar(30) not null,
    label varchar(100) not null,
    created_at timestamp not null default current_timestamp
);

create index idx_point_account_owner on point_account (owner_type, owner_reference_id);

create table payment (
    id bigint primary key auto_increment,
    donor_user_id bigint not null,
    external_payment_ref varchar(100) not null unique,
    amount_krw bigint not null,
    status varchar(30) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_payment_donor_user
        foreign key (donor_user_id) references app_user (id)
);

create table point_conversion (
    id bigint primary key auto_increment,
    payment_id bigint not null unique,
    point_account_id bigint not null,
    converted_points bigint not null,
    status varchar(30) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_point_conversion_payment
        foreign key (payment_id) references payment (id),
    constraint fk_point_conversion_account
        foreign key (point_account_id) references point_account (id)
);

create table donation_allocation (
    id bigint primary key auto_increment,
    donor_user_id bigint not null,
    charity_id bigint not null,
    donor_point_account_id bigint not null,
    charity_point_account_id bigint not null,
    allocated_points bigint not null,
    remaining_points bigint not null,
    status varchar(30) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_donation_allocation_donor_user
        foreign key (donor_user_id) references app_user (id),
    constraint fk_donation_allocation_charity
        foreign key (charity_id) references charity (id),
    constraint fk_donation_allocation_donor_account
        foreign key (donor_point_account_id) references point_account (id),
    constraint fk_donation_allocation_charity_account
        foreign key (charity_point_account_id) references point_account (id)
);

create table partner_order (
    id bigint primary key auto_increment,
    charity_id bigint not null,
    charity_manager_user_id bigint not null,
    partner_product_id bigint not null,
    donation_allocation_id bigint not null,
    quantity integer not null,
    total_points bigint not null,
    status varchar(30) not null,
    fulfilled_at timestamp null,
    created_at timestamp not null default current_timestamp,
    constraint fk_partner_order_charity
        foreign key (charity_id) references charity (id),
    constraint fk_partner_order_manager
        foreign key (charity_manager_user_id) references app_user (id),
    constraint fk_partner_order_product
        foreign key (partner_product_id) references partner_product (id),
    constraint fk_partner_order_allocation
        foreign key (donation_allocation_id) references donation_allocation (id)
);

create table point_ledger_entry (
    id bigint primary key auto_increment,
    point_account_id bigint not null,
    entry_type varchar(40) not null,
    points_delta bigint not null,
    reference_type varchar(40) not null,
    reference_id bigint not null,
    description varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_point_ledger_entry_account
        foreign key (point_account_id) references point_account (id)
);

create index idx_point_ledger_entry_account_created_at on point_ledger_entry (point_account_id, created_at);

create table audit_event (
    id bigint primary key auto_increment,
    actor_user_id bigint null,
    target_type varchar(50) not null,
    target_id bigint not null,
    action varchar(100) not null,
    event_data varchar(2000) not null,
    created_at timestamp not null default current_timestamp,
    constraint fk_audit_event_actor
        foreign key (actor_user_id) references app_user (id)
);
