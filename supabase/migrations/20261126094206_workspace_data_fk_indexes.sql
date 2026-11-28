-- Add a leading-column index for every workspace_data foreign key not already covered.
do $$
declare
  fk record;
  index_name text;
  index_columns text;
begin
  for fk in
    select c.conrelid,
      n.nspname,
      t.relname,
      c.conname,
      array_agg(u.attnum::smallint order by u.ord) as attnums,
      string_agg(format('%I', a.attname), ', ' order by u.ord) as column_list
    from pg_constraint c
    join pg_class t on t.oid=c.conrelid
    join pg_namespace n on n.oid=t.relnamespace
    cross join lateral unnest(c.conkey) with ordinality u(attnum,ord)
    join pg_attribute a on a.attrelid=c.conrelid and a.attnum=u.attnum
    where c.contype='f' and n.nspname='workspace_data'
    group by c.conrelid,n.nspname,t.relname,c.conname
  loop
    if not exists (
      select 1 from pg_index i
      where i.indrelid=fk.conrelid and i.indisvalid and i.indisready
        and i.indpred is null and i.indexprs is null
        and i.indnkeyatts >= cardinality(fk.attnums)
        and (
          select array_agg(k.attnum::smallint order by k.ord)
          from unnest(i.indkey) with ordinality k(attnum,ord)
          where k.ord <= cardinality(fk.attnums)
        ) = fk.attnums
    ) then
      index_name := left(fk.relname, 36) || '_fk_' || substr(md5(fk.conname),1,8) || '_idx';
      index_columns := fk.column_list;
      execute format('create index if not exists %I on %I.%I (%s)',
        index_name, fk.nspname, fk.relname, index_columns);
    end if;
  end loop;
end;
$$;
