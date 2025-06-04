INSERT INTO public.cities ("name")
VALUES
('Astana'),
('Almaty');

INSERT INTO public.districts (city_id,"name")
VALUES
(1,'Almatinsky District'),
(1,'Baikonur District'),
(1,'Esil District'),
(1,'Nury District'),
(1,'Saryarkinsky District'),
(1,'Saryarka District'),
(2,'Alatau District'),
(2,'Almaly District'),
(2,'Auezov District'),
(2,'Bostandyq District');

INSERT INTO public.districts (city_id,"name") 
VALUES
(2,'Zhetysu District'),
(2,'Medeu District'),
(2,'Nauryzbai District'),
(2,'Turksib District');

INSERT INTO public.auth_users (login,pass,"name",created_at)
VALUES
('test2@gmail.com','Test1234','Tester','2025-05-17 19:03:58.319882+05'),
('77083221488','#Xavisimons123','Simons','2025-05-18 13:33:47.460753+05'),
('77085414352','#Xavisimons123','Deco','2025-05-18 13:36:30.705803+05'),
('77014333412','#Wewerkj12','Soucek','2025-05-18 14:37:31.013773+05'),
('andrew.colwill@gmail.com','#Qwerty123','Andrew','2025-05-18 21:22:28.274471+05');


INSERT INTO public.ads
(
	title,
	name_appartment,
	square,num_rooms,
	floor,year_construction,
	address,
	price,
	ceiling_height,
	description,
	created_at,
	author_id,
	ads_type,
	is_active,
	stoped_at,
	city,
	district,
	pledge,
	bank
)
VALUES
('Asyl Park hata 69m sq','3',69,3,4,2021,'Manas St.',22000000,3,'fq34rv234t3bw34bw3b','2025-05-20 14:28:57.293312+05',1,1,true,'2025-06-19 14:28:57.292036+05','1','1',false,false),
('Bi City Seoul','2',55,2,4,2019,'rvwqvwq3wwc',26000000,3,'rqv33v54t45btretundyuftumkiukgumkguoimgym','2025-05-20 16:46:37.296156+05',3,1,true,'2025-06-19 16:46:37.29553+05','1','4',false,false),
('Altyn Shar, 1-room apartment ','5',38,1,4,2022,'Kayim Mukhamedkhanov, 12/3',25000000,3,'I will sell a studio apartment, warm and cozy. Not angular. With a fresh renovation. Do not disturb realtors!','2025-05-26 14:11:13.890549+05',5,1,true,'2025-06-25 14:11:13.888934+05','1','4',false,false);


INSERT INTO public.appartments("name",description,address,floors,"class",parking,peculiarities,residents_value,"comments",district_id)
VALUES
('Highvill Astana','High-rise mixed-use tower offering luxury apartments with floor-to-ceiling windows and concierge service.','123 Nurzhol Boulevard, Esil District, Astana','18-34 floors','Business','Underground','Floor-to-ceiling windows; Marble-finished lobby; Concierge desk','24/7 concierge; Rooftop fitness center; Private lounge','Stunning city views; Excellent location; Top-notch amenities',3),
('BI City Seoul','Contemporary residential complex with integrated retail podium and landscaped courtyard.','45 Kabanbai Batyr Avenue, Nury District, Astana','9-15 floors','Comfort','Underground','Retail podium; Landscaped courtyard; Community room','Café on ground floor; Children''s playground; Bike storage','Convenient shopping access; Great community vibe; Well-maintained grounds',4),
('Asyl Park','Premium mid-rise complex overlooking the city park, featuring green terraces and smart-home technology.','12 Yessentai Street, Almatinsky District, Astana','7 floors','Premium','Underground','Green terraces; Smart home system; Private garden plots','Park views; Secure gated entry; EV charging stations','Quiet park location; Modern design; Friendly neighbors',1),
('Saryarka','Modern 9-story apartment building with eco-friendly design and solar-panel rooftop.','29 Saryarka Avenue, Saryarka District, Astana','9 floors','Comfort','Ground-level','Eco-friendly design; Solar-panel rooftop; Bicycle racks','Community garden; Children''s play area; Recycling facilities','Peaceful neighborhood; Green initiatives; Friendly management',6),
('Altyn Shar','Business-class high-rise offering spacious units, granite facades, and panoramic windows.','59 Kabanbai Batyr Avenue, Nury District, Astana','9-16 floors','Business','Underground','Granite-clad exterior; Floor-to-ceiling windows; Exclusive lobby','24/7 security; On-site café; Valet parking','Great transport links; High-quality finishes; Attentive staff',4);


