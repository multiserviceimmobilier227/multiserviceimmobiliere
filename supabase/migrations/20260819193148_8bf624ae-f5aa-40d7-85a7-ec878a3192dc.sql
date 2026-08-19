-- Migration: Seed Realistic Demo Data for Souleymane
-- Goal: Create clients, land structure, and sales as if created by the PDG.

DO $$
DECLARE
    v_site_id UUID;
    v_lot_id UUID;
    v_zone_id UUID;
    v_ilot_id UUID;
    v_pdg_id UUID := 'd2a66474-30df-4d82-9b98-9dc39a8ec045'; -- souleymaneoumarou2323@gmail.com
    v_agence_id UUID := 'dfb4694d-2227-4fd2-9b94-6e2eb2e560d4';
BEGIN
    -- 1. Create a Site
    INSERT INTO public.sites (name, location, description)
    VALUES ('Maradi Sud Extension', 'Maradi', 'Projet phare 2026')
    RETURNING id INTO v_site_id;

    -- 2. Create a Lotissement
    INSERT INTO public.lotissements (name, agence_id, location, superficie_totale)
    VALUES ('Cité Horizon 2', v_agence_id, 'Maradi Sud', 50000)
    RETURNING id INTO v_lot_id;
    
    -- 3. Create a Zone, Ilot and some Plots
    INSERT INTO public.zones (lotissement_id, name, description)
    VALUES (v_lot_id, 'Zone A', 'Zone résidentielle premium')
    RETURNING id INTO v_zone_id;

    INSERT INTO public.ilots (zone_id, numero)
    VALUES (v_zone_id, '01')
    RETURNING id INTO v_ilot_id;

    -- Create Plots
    INSERT INTO public.plots (ilot_id, plot_number, surface_area, status, base_price, site_id)
    VALUES 
        (v_ilot_id, '001', 400, 'Disponible', 1500000, v_site_id),
        (v_ilot_id, '002', 400, 'Disponible', 1500000, v_site_id),
        (v_ilot_id, '003', 600, 'Disponible', 2500000, v_site_id),
        (v_ilot_id, '004', 400, 'Réservée', 1500000, v_site_id);

    -- 4. Create Demo Clients
    INSERT INTO public.clients (first_name, last_name, phone, email, civilite, occupation, id_type, id_number)
    VALUES 
        ('Ibrahim', 'Moussa', '96123456', 'ibrahim.m@example.com', 'M.', 'Commerçant', 'cni', 'NIG-1234567'),
        ('Aminatou', 'Garba', '90778899', 'aminatou.g@example.com', 'Mme', 'Enseignante', 'passeport', 'P-987654'),
        ('Oumarou', 'Sani', '91001122', 'oumarou.s@example.com', 'M.', 'Entrepreneur', 'cni', 'NIG-001122');

    -- 5. Create a Pending Sale for Ibrahim
    DECLARE
        v_client_id UUID;
        v_plot_id UUID;
        v_sale_id UUID;
    BEGIN
        SELECT id INTO v_client_id FROM public.clients WHERE last_name = 'Moussa' LIMIT 1;
        SELECT id INTO v_plot_id FROM public.plots WHERE plot_number = '001' LIMIT 1;

        INSERT INTO public.sales (
            client_id, plot_id, agency_id, total_amount, total_price, deposit_amount, balance, status, prepared_by_id, sale_date
        ) VALUES (
            v_client_id, v_plot_id, v_agence_id, 1500000, 1500000, 450000, 1050000, 'reservation', v_pdg_id, CURRENT_DATE
        ) RETURNING id INTO v_sale_id;

        -- Create payment schedule for Ibrahim (10 months)
        FOR i IN 1..10 LOOP
            INSERT INTO public.payment_schedules (sale_id, due_date, amount_due, status)
            VALUES (v_sale_id, (CURRENT_DATE + (i || ' month')::interval), 105000, 'En attente');
        END LOOP;
        
        -- Update plot status manually since trigger might be for 'en_cours'
        UPDATE public.plots SET status = 'Réservée' WHERE id = v_plot_id;
    END;
END $$;
