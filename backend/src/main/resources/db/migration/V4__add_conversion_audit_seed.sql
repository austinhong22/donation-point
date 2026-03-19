insert into audit_event (id, actor_user_id, target_type, target_id, action, event_data, created_at)
select
    11005,
    101,
    'POINT_CONVERSION',
    7001,
    'POINTS_CONVERTED',
    '{"paymentId":6001,"convertedPoints":120000}',
    timestamp '2026-03-02 09:05:00'
where not exists (
    select 1
    from audit_event
    where id = 11005
);
