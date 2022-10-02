create table keywords
(
    -- Под вопросом ограничение длинны в 256 символов.
    -- Но ограничить надо, так как это ключ
    keyword        varchar(256) primary key,
    total_products int,
    query          varchar
);

create table products
(
    id int primary key
);

create table stats
(
    timestamp      timestamp default current_timestamp,
    keyword        varchar(256) not null,
    product        int          not null,
    position       int,
    total_products int,

    foreign key (keyword) references keywords (keyword),
    foreign key (product) references products (id)
);

create index on stats (product);

create table product_stats
(
    product_id int,
    timestamp  timestamp default current_timestamp,
    data       text,
    image      text,

    foreign key (product_id) references products (id)
);

create index on product_stats (product_id);