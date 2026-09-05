INSERT INTO public.spaces (id, official_name, aliases, space_type, neighborhood, commune, surface_m2, boundaries, research_status)
VALUES
('colegiales','Parque Ferroviario Colegiales',ARRAY['Parque Ferroviario','Parque Colegiales'],'Parque','Colegiales',13,24000,'Entre Virrey Olaguer y Feliú, Moldes, Av. Federico Lacroze y vías del ferrocarril Mitre','expediente activo'),
('estacion','Parque de la Estación',ARRAY[]::text[],'Parque','Balvanera',3,NULL,NULL,'investigación pendiente'),
('saavedra','Parque Saavedra',ARRAY[]::text[],'Parque','Saavedra',12,NULL,NULL,'investigación pendiente')
ON CONFLICT (id) DO UPDATE SET official_name=EXCLUDED.official_name, aliases=EXCLUDED.aliases, space_type=EXCLUDED.space_type, neighborhood=EXCLUDED.neighborhood, commune=EXCLUDED.commune, surface_m2=EXCLUDED.surface_m2, boundaries=EXCLUDED.boundaries, research_status=EXCLUDED.research_status, updated_at=now();

INSERT INTO public.sectors (id, space_id, name)
VALUES
('s-access','colegiales','Accesos y bordes'),
('s-circulation','colegiales','Circulaciones'),
('s-stay','colegiales','Áreas de permanencia'),
('s-heritage','colegiales','Memoria ferroviaria')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, updated_at=now();
