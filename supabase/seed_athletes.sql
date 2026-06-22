-- ==========================================================================
--  Atletas/peões da PBR Brasil para o ranking de engajamento.
--  Rode no SQL Editor do Supabase. Edite/adicione livremente:
--  o sistema cruza @instagram, hashtags e o nome com a legenda dos posts.
-- ==========================================================================

insert into public.athletes (id, name, instagram, hashtags) values
  ('jvl',        'José Vitor Leme',      '@josevitorleme',     array['jvl','josevitorleme']),
  ('kaique',     'Kaique Pacheco',       '@kaiquepacheco',     array['kaiquepacheco']),
  ('rafael',     'Rafael José',          '@rafaeljose',        array['rafaeljose']),
  ('dener',      'Dener Barbosa',        '@denerbarbosa',      array['denerbarbosa']),
  ('cassio',     'Cássio Dias',          '@cassiodias',        array['cassiodias']),
  ('wingson',    'Wingson Henrique',     '@wingsonhenrique',   array['wingson']),
  ('leonardo',   'Leonardo Castro',      '@leonardocastro',    array['leonardocastro']),
  ('joaoricardo','João Ricardo Vieira',  '@joaoricardovieira', array['joaoricardo'])
on conflict (id) do update
  set name = excluded.name,
      instagram = excluded.instagram,
      hashtags = excluded.hashtags;
