--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: analyze_index_performance(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.analyze_index_performance() RETURNS TABLE(schemaname text, tablename text, indexname text, num_rows bigint, table_size text, index_size text, index_usage_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::TEXT,
        s.tablename::TEXT,
        s.indexname::TEXT,
        pg_class.reltuples::BIGINT as num_rows,
        pg_size_pretty(pg_total_relation_size(s.tablename::regclass))::TEXT as table_size,
        pg_size_pretty(pg_total_relation_size(s.indexname::regclass))::TEXT as index_size,
        pg_stat_user_indexes.idx_scan as index_usage_count
    FROM pg_stat_user_indexes s
    JOIN pg_class ON pg_class.oid = s.relid
    WHERE s.schemaname = 'public'
    ORDER BY pg_stat_user_indexes.idx_scan DESC;
END;
$$;


ALTER FUNCTION public.analyze_index_performance() OWNER TO postgres;

--
-- Name: apply_special_offer(integer, integer, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.apply_special_offer(offer_id integer, tour_id integer, base_amount numeric) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    offer_info RECORD;
    discount_amount DECIMAL := 0;
    final_amount DECIMAL;
    is_applicable BOOLEAN := FALSE;
BEGIN
    -- RÃ©cupÃ©rer les informations de l'offre
    SELECT 
        so.offer_type,
        so.discount_percentage,
        so.discount_amount,
        so.minimum_amount,
        so.maximum_discount,
        so.applicable_tours,
        so.is_active,
        so.valid_from,
        so.valid_until,
        so.usage_count,
        so.usage_limit
    INTO offer_info
    FROM special_offers so
    WHERE so.id = offer_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Offer not found'
        );
    END IF;
    
    -- VÃ©rifications de validitÃ©
    IF NOT offer_info.is_active THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Offer is not active');
    END IF;
    
    IF CURRENT_DATE < offer_info.valid_from OR CURRENT_DATE > offer_info.valid_until THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Offer has expired');
    END IF;
    
    IF offer_info.usage_limit > 0 AND offer_info.usage_count >= offer_info.usage_limit THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Offer usage limit reached');
    END IF;
    
    IF base_amount < offer_info.minimum_amount THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Minimum amount not met');
    END IF;
    
    -- VÃ©rifier si l'offre s'applique Ã  ce tour
    IF offer_info.applicable_tours IS NOT NULL AND NOT (tour_id = ANY(offer_info.applicable_tours)) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Offer not applicable to this tour');
    END IF;
    
    -- Calculer la rÃ©duction
    IF offer_info.offer_type = 'percentage' THEN
        discount_amount := base_amount * (offer_info.discount_percentage / 100);
    ELSIF offer_info.offer_type = 'fixed_amount' THEN
        discount_amount := offer_info.discount_amount;
    END IF;
    
    -- Appliquer la limite de rÃ©duction maximale
    IF offer_info.maximum_discount > 0 THEN
        discount_amount := LEAST(discount_amount, offer_info.maximum_discount);
    END IF;
    
    final_amount := GREATEST(0, base_amount - discount_amount);
    
    RETURN jsonb_build_object(
        'success', TRUE,
        'base_amount', base_amount,
        'discount_amount', discount_amount,
        'final_amount', final_amount,
        'discount_percentage', CASE WHEN base_amount > 0 THEN ROUND((discount_amount / base_amount * 100), 2) ELSE 0 END,
        'offer_details', jsonb_build_object(
            'type', offer_info.offer_type,
            'value', CASE WHEN offer_info.offer_type = 'percentage' THEN offer_info.discount_percentage ELSE offer_info.discount_amount END
        )
    );
END;
$$;


ALTER FUNCTION public.apply_special_offer(offer_id integer, tour_id integer, base_amount numeric) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tours (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    main_image_url character varying(255),
    itinerary jsonb,
    is_active boolean DEFAULT true,
    category character varying(100),
    destinations text[],
    slug character varying(255),
    themes text[],
    rating numeric(3,2) DEFAULT 4.8,
    review_count integer DEFAULT 0,
    is_new boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category_id integer,
    is_featured boolean DEFAULT false,
    is_bestseller boolean DEFAULT false,
    is_trending boolean DEFAULT false,
    display_order integer DEFAULT 0,
    short_description character varying(500),
    highlights text[],
    inclusions text[],
    exclusions text[],
    min_age integer DEFAULT 0,
    max_group_size integer DEFAULT 20,
    languages character varying(200) DEFAULT 'English'::character varying,
    original_price numeric(10,2),
    discount_percentage numeric(5,2) DEFAULT 0.00,
    early_bird_discount numeric(5,2) DEFAULT 0.00,
    group_discount_threshold integer DEFAULT 4,
    group_discount_percentage numeric(5,2) DEFAULT 0.00,
    available_from date,
    available_until date,
    blackout_dates jsonb DEFAULT '[]'::jsonb,
    seasonal_pricing jsonb DEFAULT '{}'::jsonb,
    gallery_images text[],
    video_url character varying(500),
    virtual_tour_url character varying(500),
    thumbnail_image character varying(255),
    view_count integer DEFAULT 0,
    booking_count integer DEFAULT 0,
    wishlist_count integer DEFAULT 0,
    avg_rating numeric(3,2) DEFAULT 0.00,
    meta_title character varying(255),
    meta_description text,
    meta_keywords character varying(500),
    canonical_url character varying(500),
    starting_location character varying(200),
    ending_location character varying(200),
    coordinates point,
    covered_destinations text[],
    cancellation_policy text,
    booking_terms text,
    what_to_bring text[],
    important_notes text,
    eco_friendly boolean DEFAULT false,
    cultural_immersion boolean DEFAULT false,
    family_friendly boolean DEFAULT false,
    adventure_level character varying(20) DEFAULT 'low'::character varying,
    CONSTRAINT chk_tours_age_minimum_valid CHECK (((min_age >= 0) AND (min_age <= 100))),
    CONSTRAINT chk_tours_counts_positive CHECK (((view_count >= 0) AND (booking_count >= 0) AND (wishlist_count >= 0) AND (review_count >= 0))),
    CONSTRAINT chk_tours_discount_valid CHECK (((discount_percentage >= (0)::numeric) AND (discount_percentage <= (100)::numeric))),
    CONSTRAINT chk_tours_group_size_valid CHECK ((max_group_size > 0)),
    CONSTRAINT chk_tours_price_positive CHECK ((original_price >= (0)::numeric)),
    CONSTRAINT chk_tours_rating_valid CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))
);


ALTER TABLE public.tours OWNER TO postgres;

--
-- Name: COLUMN tours.destinations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tours.destinations IS 'Array of destination names for filtering';


--
-- Name: COLUMN tours.themes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tours.themes IS 'Array of tour themes (nature, culture, adventure, etc.)';


--
-- Name: calculate_discounted_price(public.tours); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_discounted_price(tour_record public.tours) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF tour_record.discount_percentage > 0 THEN
        RETURN tour_record.original_price * (1 - tour_record.discount_percentage / 100);
    ELSE
        RETURN tour_record.original_price;
    END IF;
END;
$$;


ALTER FUNCTION public.calculate_discounted_price(tour_record public.tours) OWNER TO postgres;

--
-- Name: calculate_group_price(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_group_price(tour_id integer, group_size integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    tour_info RECORD;
    base_price DECIMAL;
    group_discount DECIMAL := 0;
    final_price DECIMAL;
    savings DECIMAL := 0;
BEGIN
    -- RÃ©cupÃ©rer les informations du tour
    SELECT t.original_price, t.group_discount_threshold, t.group_discount_percentage
    INTO tour_info
    FROM tours t
    WHERE t.id = tour_id AND t.is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Tour not found');
    END IF;
    
    base_price := tour_info.original_price * group_size;
    
    -- Appliquer la rÃ©duction de groupe si applicable
    IF group_size >= tour_info.group_discount_threshold AND tour_info.group_discount_percentage > 0 THEN
        group_discount := tour_info.group_discount_percentage;
        savings := base_price * (group_discount / 100);
        final_price := base_price - savings;
    ELSE
        final_price := base_price;
    END IF;
    
    RETURN jsonb_build_object(
        'group_size', group_size,
        'price_per_person', tour_info.original_price,
        'base_total', base_price,
        'group_discount_percentage', group_discount,
        'savings', savings,
        'final_total', final_price,
        'price_per_person_after_discount', CASE WHEN group_size > 0 THEN final_price / group_size ELSE 0 END
    );
END;
$$;


ALTER FUNCTION public.calculate_group_price(tour_id integer, group_size integer) OWNER TO postgres;

--
-- Name: calculate_reading_time(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_reading_time(content_text text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    word_count INTEGER;
    reading_speed INTEGER := 200; -- mots par minute (vitesse moyenne de lecture)
BEGIN
    -- Compter les mots (approximation basÃ©e sur les espaces)
    word_count := array_length(string_to_array(trim(content_text), ' '), 1);
    
    -- Calculer le temps de lecture en minutes (minimum 1 minute)
    RETURN GREATEST(1, CEIL(word_count::DECIMAL / reading_speed));
END;
$$;


ALTER FUNCTION public.calculate_reading_time(content_text text) OWNER TO postgres;

--
-- Name: featured_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.featured_reviews (
    id integer NOT NULL,
    original_review_id integer,
    customer_name character varying(100) NOT NULL,
    customer_email character varying(255),
    customer_location character varying(100),
    customer_avatar character varying(255),
    rating integer NOT NULL,
    title character varying(200),
    review_text text NOT NULL,
    tour_name character varying(200),
    tour_id integer,
    travel_date date,
    review_source character varying(50) DEFAULT 'website'::character varying,
    review_language character varying(5) DEFAULT 'en'::character varying,
    is_featured boolean DEFAULT true,
    is_homepage_highlight boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    display_order integer DEFAULT 0,
    helpful_votes integer DEFAULT 0,
    total_votes integer DEFAULT 0,
    view_count integer DEFAULT 0,
    moderation_status character varying(20) DEFAULT 'pending'::character varying,
    moderated_by integer,
    moderated_at timestamp without time zone,
    moderation_notes text,
    team_response text,
    team_response_by integer,
    team_response_at timestamp without time zone,
    sentiment_score numeric(3,2),
    keywords text[],
    group_size integer,
    travel_type character varying(50),
    review_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_featured_reviews_engagement_positive CHECK (((helpful_votes >= 0) AND (total_votes >= 0))),
    CONSTRAINT chk_featured_reviews_rating_valid CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT chk_featured_reviews_sentiment_valid CHECK (((sentiment_score >= ('-1'::integer)::numeric) AND (sentiment_score <= (1)::numeric))),
    CONSTRAINT chk_helpful_votes CHECK (((helpful_votes >= 0) AND (helpful_votes <= total_votes))),
    CONSTRAINT chk_sentiment_score CHECK (((sentiment_score IS NULL) OR ((sentiment_score >= ('-1'::integer)::numeric) AND (sentiment_score <= (1)::numeric)))),
    CONSTRAINT featured_reviews_moderation_status_check CHECK (((moderation_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'flagged'::character varying])::text[]))),
    CONSTRAINT featured_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.featured_reviews OWNER TO postgres;

--
-- Name: calculate_review_relevance_score(public.featured_reviews); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_review_relevance_score(review_record public.featured_reviews) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    score DECIMAL(5,2) := 0.00;
BEGIN
    -- Score basÃ© sur la note (30%)
    score := score + (review_record.rating * 6);
    
    -- Score basÃ© sur la vÃ©rification (20%)
    IF review_record.is_verified THEN
        score := score + 20;
    END IF;
    
    -- Score basÃ© sur l'engagement (25%)
    IF review_record.total_votes > 0 THEN
        score := score + (review_record.helpful_votes::DECIMAL / review_record.total_votes * 25);
    END IF;
    
    -- Score basÃ© sur la longueur du texte (15%)
    IF LENGTH(review_record.review_text) > 100 THEN
        score := score + 15;
    ELSIF LENGTH(review_record.review_text) > 50 THEN
        score := score + 10;
    ELSIF LENGTH(review_record.review_text) > 20 THEN
        score := score + 5;
    END IF;
    
    -- Score basÃ© sur la rÃ©cence (10%)
    IF review_record.review_date > CURRENT_TIMESTAMP - INTERVAL '30 days' THEN
        score := score + 10;
    ELSIF review_record.review_date > CURRENT_TIMESTAMP - INTERVAL '90 days' THEN
        score := score + 7;
    ELSIF review_record.review_date > CURRENT_TIMESTAMP - INTERVAL '180 days' THEN
        score := score + 5;
    END IF;
    
    RETURN LEAST(score, 100.00);
END;
$$;


ALTER FUNCTION public.calculate_review_relevance_score(review_record public.featured_reviews) OWNER TO postgres;

--
-- Name: calculate_sentiment_score(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_sentiment_score(review_text text) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    positive_words TEXT[] := ARRAY['excellent', 'amazing', 'wonderful', 'fantastic', 'great', 'good', 'beautiful', 'perfect', 'love', 'recommend', 'best', 'awesome', 'incredible', 'outstanding', 'superb'];
    negative_words TEXT[] := ARRAY['terrible', 'awful', 'bad', 'horrible', 'worst', 'disappointing', 'poor', 'hate', 'never', 'waste', 'money', 'scam', 'fraud', 'disgusting'];
    neutral_words TEXT[] := ARRAY['okay', 'average', 'normal', 'standard', 'typical', 'regular', 'fine', 'acceptable'];
    
    positive_count INTEGER := 0;
    negative_count INTEGER := 0;
    neutral_count INTEGER := 0;
    total_words INTEGER;
    sentiment_score DECIMAL;
    word TEXT;
BEGIN
    -- Convertir en minuscules et diviser en mots
    review_text := lower(review_text);
    
    -- Compter les mots positifs
    FOREACH word IN ARRAY positive_words LOOP
        positive_count := positive_count + (length(review_text) - length(replace(review_text, word, ''))) / length(word);
    END LOOP;
    
    -- Compter les mots nÃ©gatifs
    FOREACH word IN ARRAY negative_words LOOP
        negative_count := negative_count + (length(review_text) - length(replace(review_text, word, ''))) / length(word);
    END LOOP;
    
    -- Compter les mots neutres
    FOREACH word IN ARRAY neutral_words LOOP
        neutral_count := neutral_count + (length(review_text) - length(replace(review_text, word, ''))) / length(word);
    END LOOP;
    
    total_words := positive_count + negative_count + neutral_count;
    
    -- Calculer le score (-1 Ã  1)
    IF total_words = 0 THEN
        sentiment_score := 0;
    ELSE
        sentiment_score := (positive_count - negative_count)::DECIMAL / total_words;
        -- Normaliser entre -1 et 1
        sentiment_score := GREATEST(-1, LEAST(1, sentiment_score));
    END IF;
    
    RETURN sentiment_score;
END;
$$;


ALTER FUNCTION public.calculate_sentiment_score(review_text text) OWNER TO postgres;

--
-- Name: tour_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_statistics (
    id integer NOT NULL,
    tour_id integer NOT NULL,
    total_bookings integer DEFAULT 0,
    total_revenue numeric(12,2) DEFAULT 0.00,
    total_participants integer DEFAULT 0,
    bookings_this_month integer DEFAULT 0,
    bookings_last_month integer DEFAULT 0,
    revenue_this_month numeric(12,2) DEFAULT 0.00,
    revenue_last_month numeric(12,2) DEFAULT 0.00,
    avg_rating numeric(3,2) DEFAULT 0.00,
    total_reviews integer DEFAULT 0,
    five_star_reviews integer DEFAULT 0,
    four_star_reviews integer DEFAULT 0,
    three_star_reviews integer DEFAULT 0,
    two_star_reviews integer DEFAULT 0,
    one_star_reviews integer DEFAULT 0,
    page_views integer DEFAULT 0,
    page_views_this_month integer DEFAULT 0,
    inquiries_count integer DEFAULT 0,
    conversion_rate numeric(5,2) DEFAULT 0.00,
    wishlist_count integer DEFAULT 0,
    share_count integer DEFAULT 0,
    click_count integer DEFAULT 0,
    cancellation_rate numeric(5,2) DEFAULT 0.00,
    repeat_customer_rate numeric(5,2) DEFAULT 0.00,
    recommendation_score numeric(3,2) DEFAULT 0.00,
    peak_season_bookings integer DEFAULT 0,
    off_season_bookings integer DEFAULT 0,
    avg_booking_value numeric(10,2) DEFAULT 0.00,
    min_booking_value numeric(10,2),
    max_booking_value numeric(10,2),
    domestic_bookings integer DEFAULT 0,
    international_bookings integer DEFAULT 0,
    group_bookings integer DEFAULT 0,
    individual_bookings integer DEFAULT 0,
    avg_booking_lead_time integer DEFAULT 0,
    last_booking_date timestamp without time zone,
    first_booking_date timestamp without time zone,
    is_trending boolean DEFAULT false,
    is_bestseller boolean DEFAULT false,
    trend_score numeric(5,2) DEFAULT 0.00,
    last_calculated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cancellation_rate CHECK (((cancellation_rate >= (0)::numeric) AND (cancellation_rate <= (100)::numeric))),
    CONSTRAINT chk_conversion_rate CHECK (((conversion_rate >= (0)::numeric) AND (conversion_rate <= (100)::numeric))),
    CONSTRAINT chk_ratings CHECK (((avg_rating >= (0)::numeric) AND (avg_rating <= (5)::numeric))),
    CONSTRAINT chk_recommendation_score CHECK (((recommendation_score >= (0)::numeric) AND (recommendation_score <= (5)::numeric))),
    CONSTRAINT chk_repeat_rate CHECK (((repeat_customer_rate >= (0)::numeric) AND (repeat_customer_rate <= (100)::numeric))),
    CONSTRAINT chk_trend_score CHECK (((trend_score >= (0)::numeric) AND (trend_score <= (100)::numeric)))
);


ALTER TABLE public.tour_statistics OWNER TO postgres;

--
-- Name: calculate_trend_score(public.tour_statistics); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_trend_score(stat_record public.tour_statistics) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    score DECIMAL(5,2) := 0.00;
BEGIN
    -- Calcul basÃ© sur plusieurs mÃ©triques
    -- 40% basÃ© sur les rÃ©servations rÃ©centes
    IF stat_record.bookings_last_month > 0 THEN
        score := score + (LEAST(stat_record.bookings_this_month::DECIMAL / stat_record.bookings_last_month * 40, 40));
    ELSE
        score := score + (LEAST(stat_record.bookings_this_month * 2, 40));
    END IF;
    
    -- 30% basÃ© sur la note moyenne
    score := score + (stat_record.avg_rating * 6);
    
    -- 20% basÃ© sur le taux de conversion
    score := score + (stat_record.conversion_rate * 0.2);
    
    -- 10% basÃ© sur les vues rÃ©centes
    score := score + (LEAST(stat_record.page_views_this_month::DECIMAL / 100, 10));
    
    RETURN LEAST(score, 100.00);
END;
$$;


ALTER FUNCTION public.calculate_trend_score(stat_record public.tour_statistics) OWNER TO postgres;

--
-- Name: check_tour_availability(integer, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_tour_availability(tour_id integer, check_date date) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    tour_info RECORD;
    is_available BOOLEAN := FALSE;
    reason TEXT := '';
BEGIN
    -- RÃ©cupÃ©rer les informations du tour
    SELECT t.is_active, t.available_from, t.available_until, t.blackout_dates
    INTO tour_info
    FROM tours t
    WHERE t.id = tour_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'available', FALSE,
            'reason', 'Tour not found'
        );
    END IF;
    
    -- VÃ©rifier si le tour est actif
    IF NOT tour_info.is_active THEN
        reason := 'Tour is not active';
    -- VÃ©rifier la pÃ©riode de disponibilitÃ©
    ELSIF check_date < tour_info.available_from THEN
        reason := 'Date is before availability period';
    ELSIF check_date > tour_info.available_until THEN
        reason := 'Date is after availability period';
    -- VÃ©rifier les dates d'interdiction
    ELSIF tour_info.blackout_dates IS NOT NULL AND tour_info.blackout_dates ? check_date::text THEN
        reason := 'Date is in blackout period';
    ELSE
        is_available := TRUE;
        reason := 'Available';
    END IF;
    
    RETURN jsonb_build_object(
        'available', is_available,
        'reason', reason,
        'check_date', check_date
    );
END;
$$;


ALTER FUNCTION public.check_tour_availability(tour_id integer, check_date date) OWNER TO postgres;

--
-- Name: cleanup_old_data(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_old_data(days_old integer DEFAULT 365) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER := 0;
    result_text TEXT := '';
BEGIN
    -- Nettoyer les offres expirÃ©es
    DELETE FROM special_offers 
    WHERE valid_until < CURRENT_DATE - INTERVAL '1 day' * days_old
    AND usage_count = 0;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result_text := result_text || 'Deleted ' || deleted_count || ' expired unused offers. ';
    
    -- Nettoyer les logs de migration anciens (garder seulement les 100 derniers)
    DELETE FROM migration_log 
    WHERE id NOT IN (
        SELECT id FROM migration_log 
        ORDER BY created_at DESC 
        LIMIT 100
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    result_text := result_text || 'Deleted ' || deleted_count || ' old migration logs. ';
    
    -- Mettre Ã  jour les statistiques des tables
    PERFORM update_table_statistics();
    result_text := result_text || 'Updated table statistics.';
    
    RETURN result_text;
END;
$$;


ALTER FUNCTION public.cleanup_old_data(days_old integer) OWNER TO postgres;

--
-- Name: clear_test_results(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clear_test_results() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM test_results;
    RAISE NOTICE 'Test results cleared';
END;
$$;


ALTER FUNCTION public.clear_test_results() OWNER TO postgres;

--
-- Name: extract_table_of_contents(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.extract_table_of_contents(content_text text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    toc JSONB := '[]';
    lines TEXT[];
    line TEXT;
    heading_level INTEGER;
    heading_text TEXT;
    heading_id TEXT;
BEGIN
    -- Diviser le contenu en lignes
    lines := string_to_array(content_text, E'\n');
    
    -- Parcourir chaque ligne pour trouver les titres (format Markdown)
    FOREACH line IN ARRAY lines
    LOOP
        -- DÃ©tecter les titres Markdown (# ## ### etc.)
        IF line ~ '^#{1,6}\s+' THEN
            -- Extraire le niveau du titre
            heading_level := length(split_part(line, ' ', 1));
            
            -- Extraire le texte du titre
            heading_text := trim(substring(line from '^#{1,6}\s+(.*)'));
            
            -- GÃ©nÃ©rer un ID pour le titre
            heading_id := lower(regexp_replace(heading_text, '[^a-zA-Z0-9\s]', '', 'g'));
            heading_id := regexp_replace(heading_id, '\s+', '-', 'g');
            
            -- Ajouter Ã  la table des matiÃ¨res
            toc := toc || jsonb_build_object(
                'level', heading_level,
                'text', heading_text,
                'id', heading_id
            );
        END IF;
    END LOOP;
    
    RETURN toc;
END;
$$;


ALTER FUNCTION public.extract_table_of_contents(content_text text) OWNER TO postgres;

--
-- Name: find_unused_indexes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_unused_indexes() RETURNS TABLE(schemaname text, tablename text, indexname text, index_size text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::TEXT,
        s.tablename::TEXT,
        s.indexname::TEXT,
        pg_size_pretty(pg_relation_size(s.indexname::regclass))::TEXT as index_size
    FROM pg_stat_user_indexes s
    WHERE s.idx_scan = 0
    AND s.schemaname = 'public'
    AND s.indexname NOT LIKE '%_pkey'  -- Exclure les clÃ©s primaires
    ORDER BY pg_relation_size(s.indexname::regclass) DESC;
END;
$$;


ALTER FUNCTION public.find_unused_indexes() OWNER TO postgres;

--
-- Name: generate_destination_slug(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_destination_slug(destination_name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- GÃ©nÃ©rer le slug de base
    base_slug := lower(trim(destination_name));
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(base_slug, '-');
    
    final_slug := base_slug;
    
    -- VÃ©rifier l'unicitÃ© et ajouter un suffixe si nÃ©cessaire
    WHILE EXISTS (SELECT 1 FROM destinations WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$;


ALTER FUNCTION public.generate_destination_slug(destination_name text) OWNER TO postgres;

--
-- Name: generate_test_report(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_test_report() RETURNS TABLE(category text, total bigint, passed bigint, failed bigint, warnings bigint, success_rate numeric, avg_time numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.test_category::TEXT,
        tr.total_tests,
        tr.passed_tests,
        tr.failed_tests,
        tr.warning_tests,
        tr.success_rate,
        ROUND(tr.avg_execution_time_seconds::DECIMAL, 4)
    FROM v_test_report tr;
END;
$$;


ALTER FUNCTION public.generate_test_report() OWNER TO postgres;

--
-- Name: get_failed_tests(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_failed_tests() RETURNS TABLE(test_name text, category text, message text, expected text, actual text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.test_name::TEXT,
        tr.test_category::TEXT,
        tr.message::TEXT,
        tr.expected_value::TEXT,
        tr.actual_value::TEXT
    FROM test_results tr
    WHERE tr.status = 'FAIL'
    ORDER BY tr.test_category, tr.test_name;
END;
$$;


ALTER FUNCTION public.get_failed_tests() OWNER TO postgres;

--
-- Name: get_homepage_data(boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_homepage_data(use_cache boolean DEFAULT true) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    result JSONB;
    cache_key TEXT := 'homepage_data';
    cached_data JSONB;
BEGIN
    -- VÃ©rifier le cache si demandÃ© (simulation - dans une vraie implÃ©mentation, utiliser Redis)
    IF use_cache THEN
        -- Ici, on simule un cache en vÃ©rifiant la derniÃ¨re mise Ã  jour
        SELECT 
            jsonb_object_agg(section_type, section_data ORDER BY section_order)
        INTO cached_data
        FROM v_homepage_data
        WHERE is_active = TRUE;
        
        RETURN cached_data;
    END IF;
    
    -- RÃ©cupÃ©rer les donnÃ©es fraÃ®ches
    SELECT 
        jsonb_object_agg(section_type, section_data ORDER BY section_order)
    INTO result
    FROM v_homepage_data
    WHERE is_active = TRUE;
    
    RETURN result;
END;
$$;


ALTER FUNCTION public.get_homepage_data(use_cache boolean) OWNER TO postgres;

--
-- Name: get_monthly_trends(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_monthly_trends(months_back integer DEFAULT 12) RETURNS TABLE(month_year text, new_tours integer, total_bookings integer, total_revenue numeric, avg_rating numeric, new_reviews integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    WITH monthly_data AS (
        SELECT 
            TO_CHAR(date_trunc('month', t.created_at), 'YYYY-MM') as month_year,
            COUNT(*) as new_tours,
            SUM(t.booking_count) as total_bookings,
            SUM(t.booking_count * t.original_price) as total_revenue,
            AVG(t.average_rating) as avg_rating,
            SUM(t.review_count) as new_reviews
        FROM tours t
        WHERE t.created_at >= CURRENT_DATE - INTERVAL '1 month' * months_back
        GROUP BY date_trunc('month', t.created_at)
        ORDER BY date_trunc('month', t.created_at) DESC
    )
    SELECT 
        md.month_year,
        md.new_tours::INTEGER,
        md.total_bookings::INTEGER,
        ROUND(md.total_revenue, 2),
        ROUND(md.avg_rating, 2),
        md.new_reviews::INTEGER
    FROM monthly_data md;
END;
$$;


ALTER FUNCTION public.get_monthly_trends(months_back integer) OWNER TO postgres;

--
-- Name: get_popular_recommendations(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_popular_recommendations(limit_count integer DEFAULT 6) RETURNS TABLE(id integer, title character varying, slug character varying, price numeric, rating numeric, booking_count integer, thumbnail character varying, category_name character varying, destination_name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.slug,
        t.original_price,
        t.rating,
        t.booking_count,
        t.thumbnail_image,
        tc.name as category_name,
        d.name as destination_name
    FROM tours t
    LEFT JOIN tour_categories tc ON t.category_id = tc.id
    LEFT JOIN destinations d ON d.id = ANY(t.covered_destinations::INTEGER[])
    WHERE t.is_active = TRUE
    ORDER BY 
        (t.booking_count * 0.4 + t.view_count * 0.3 + t.rating * t.review_count * 0.3) DESC,
        t.rating DESC
    LIMIT limit_count;
END;
$$;


ALTER FUNCTION public.get_popular_recommendations(limit_count integer) OWNER TO postgres;

--
-- Name: get_reviews_with_sentiment(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_reviews_with_sentiment(tour_id integer, limit_count integer DEFAULT 10) RETURNS TABLE(id integer, customer_name text, rating integer, review_text text, sentiment_score numeric, sentiment_label text, helpful_count integer, created_at timestamp without time zone, is_verified boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fr.id,
        fr.customer_name,
        fr.rating,
        fr.review_text,
        fr.sentiment_score,
        CASE 
            WHEN fr.sentiment_score > 0.3 THEN 'Positive'
            WHEN fr.sentiment_score < -0.3 THEN 'Negative'
            ELSE 'Neutral'
        END as sentiment_label,
        fr.helpful_count,
        fr.created_at,
        fr.is_verified
    FROM featured_reviews fr
    WHERE fr.tour_id = get_reviews_with_sentiment.tour_id
    AND fr.moderation_status = 'approved'
    ORDER BY fr.helpful_count DESC, fr.created_at DESC
    LIMIT limit_count;
END;
$$;


ALTER FUNCTION public.get_reviews_with_sentiment(tour_id integer, limit_count integer) OWNER TO postgres;

--
-- Name: get_similar_tours(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_similar_tours(tour_id integer, limit_count integer DEFAULT 4) RETURNS TABLE(id integer, title character varying, slug character varying, price numeric, original_price numeric, rating numeric, review_count integer, thumbnail character varying, category_name character varying, destination_name character varying, similarity_score numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    base_tour RECORD;
BEGIN
    -- RÃ©cupÃ©rer les informations du tour de base
    SELECT t.category_id, t.destinations, t.original_price
    INTO base_tour
    FROM tours t
    WHERE t.id = tour_id AND t.is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        t.id,
        t.name as title,
        t.slug,
        t.original_price as price,
        t.original_price,
        t.rating,
        t.review_count,
        t.thumbnail_image as thumbnail,
        -- t.duration_days, -- Colonne supprimÃ©e
        tc.name as category_name,
        d.name as destination_name,
        -- Calcul du score de similaritÃ© (colonnes duration_days et difficulty_level supprimÃ©es)
        (
            CASE WHEN t.category_id = base_tour.category_id THEN 40 ELSE 0 END +
            CASE WHEN t.destinations && base_tour.destinations THEN 35 ELSE 0 END +
            CASE WHEN ABS(t.original_price - base_tour.original_price) <= base_tour.original_price * 0.3 THEN 25 ELSE 0 END
            -- CASE WHEN ABS(t.duration_days - base_tour.duration_days) <= 1 THEN 15 ELSE 0 END + -- SupprimÃ©
            -- CASE WHEN t.difficulty_level = base_tour.difficulty_level THEN 10 ELSE 0 END -- SupprimÃ©
        )::DECIMAL as similarity_score
    FROM tours t
    LEFT JOIN tour_categories tc ON t.category_id = tc.id
    LEFT JOIN destinations d ON d.name = ANY(t.destinations)
    WHERE t.is_active = TRUE 
    AND t.id != tour_id
    ORDER BY similarity_score DESC, t.rating DESC, t.booking_count DESC
    LIMIT limit_count;
END;
$$;


ALTER FUNCTION public.get_similar_tours(tour_id integer, limit_count integer) OWNER TO postgres;

--
-- Name: get_tour_performance_stats(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_tour_performance_stats(tour_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    stats RECORD;
    category_avg RECORD;
    destination_avg RECORD;
BEGIN
    -- RÃ©cupÃ©rer les statistiques du tour
    SELECT 
        t.view_count,
        t.booking_count,
        t.wishlist_count,
        t.rating,
        t.review_count,
        t.original_price,
        t.category_id,
        t.destination_id,
        t.created_at
    INTO stats
    FROM tours t
    WHERE t.id = tour_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Tour not found');
    END IF;
    
    -- RÃ©cupÃ©rer les moyennes de la catÃ©gorie
    SELECT 
        AVG(t.view_count) as avg_views,
        AVG(t.booking_count) as avg_bookings,
        AVG(t.rating) as avg_rating
    INTO category_avg
    FROM tours t
    WHERE t.category_id = stats.category_id AND t.is_active = TRUE;
    
    -- RÃ©cupÃ©rer les moyennes de la destination
    SELECT 
        AVG(t.view_count) as avg_views,
        AVG(t.booking_count) as avg_bookings,
        AVG(t.rating) as avg_rating
    INTO destination_avg
    FROM tours t
    WHERE t.destination_id = stats.destination_id AND t.is_active = TRUE;
    
    RETURN jsonb_build_object(
        'tour_stats', jsonb_build_object(
            'views', stats.view_count,
            'bookings', stats.booking_count,
            'wishlists', stats.wishlist_count,
            'rating', stats.rating,
            'reviews', stats.review_count,
            'conversion_rate', CASE WHEN stats.view_count > 0 THEN ROUND((stats.booking_count::DECIMAL / stats.view_count * 100), 2) ELSE 0 END
        ),
        'category_comparison', jsonb_build_object(
            'views_vs_avg', CASE WHEN category_avg.avg_views > 0 THEN ROUND((stats.view_count / category_avg.avg_views * 100), 2) ELSE 0 END,
            'bookings_vs_avg', CASE WHEN category_avg.avg_bookings > 0 THEN ROUND((stats.booking_count / category_avg.avg_bookings * 100), 2) ELSE 0 END,
            'rating_vs_avg', CASE WHEN category_avg.avg_rating > 0 THEN ROUND((stats.rating / category_avg.avg_rating * 100), 2) ELSE 0 END
        ),
        'destination_comparison', jsonb_build_object(
            'views_vs_avg', CASE WHEN destination_avg.avg_views > 0 THEN ROUND((stats.view_count / destination_avg.avg_views * 100), 2) ELSE 0 END,
            'bookings_vs_avg', CASE WHEN destination_avg.avg_bookings > 0 THEN ROUND((stats.booking_count / destination_avg.avg_bookings * 100), 2) ELSE 0 END,
            'rating_vs_avg', CASE WHEN destination_avg.avg_rating > 0 THEN ROUND((stats.rating / destination_avg.avg_rating * 100), 2) ELSE 0 END
        )
    );
END;
$$;


ALTER FUNCTION public.get_tour_performance_stats(tour_id integer) OWNER TO postgres;

--
-- Name: maintain_tour_pricing(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.maintain_tour_pricing() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Si le prix original change, recalculer le prix avec rÃ©duction
    IF NEW.original_price != OLD.original_price OR NEW.discount_percentage != OLD.discount_percentage THEN
        NEW.price := NEW.original_price * (1 - NEW.discount_percentage / 100.0);
    END IF;
    
    -- VÃ©rifier que le prix final n'est pas nÃ©gatif
    IF NEW.price < 0 THEN
        NEW.price := 0;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.maintain_tour_pricing() OWNER TO postgres;

--
-- Name: optimize_database_performance(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.optimize_database_performance() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    result_text TEXT := '';
BEGIN
    -- RafraÃ®chir les vues matÃ©rialisÃ©es
    PERFORM refresh_materialized_views();
    result_text := result_text || 'Refreshed materialized views. ';
    
    -- Recalculer toutes les statistiques
    PERFORM recalculate_all_statistics();
    result_text := result_text || 'Recalculated all statistics. ';
    
    -- Analyser les tables principales
    PERFORM update_table_statistics();
    result_text := result_text || 'Updated table statistics. ';
    
    -- Nettoyer les donnÃ©es anciennes
    result_text := result_text || cleanup_old_data(365);
    
    RETURN result_text;
END;
$$;


ALTER FUNCTION public.optimize_database_performance() OWNER TO postgres;

--
-- Name: recalculate_all_statistics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.recalculate_all_statistics() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    category_record RECORD;
    destination_record RECORD;
    result_text TEXT := '';
BEGIN
    -- Recalculer les statistiques des catÃ©gories
    FOR category_record IN SELECT id FROM tour_categories LOOP
        UPDATE tour_categories SET
            active_tour_count = (
                SELECT COUNT(*) FROM tours 
                WHERE category_id = category_record.id AND is_active = TRUE
            ),
            total_bookings = (
                SELECT COALESCE(SUM(booking_count), 0) FROM tours 
                WHERE category_id = category_record.id AND is_active = TRUE
            ),
            avg_rating = (
                SELECT COALESCE(AVG(rating), 0) FROM tours 
                WHERE category_id = category_record.id AND is_active = TRUE AND review_count > 0
            ),
            total_reviews = (
                SELECT COALESCE(SUM(review_count), 0) FROM tours 
                WHERE category_id = category_record.id AND is_active = TRUE
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = category_record.id;
    END LOOP;
    
    -- Recalculer les statistiques des destinations
    FOR destination_record IN SELECT id FROM destinations LOOP
        PERFORM update_destination_stats(destination_record.id);
    END LOOP;
    
    result_text := 'Statistics recalculated for ' || 
                   (SELECT COUNT(*) FROM tour_categories) || ' categories and ' ||
                   (SELECT COUNT(*) FROM destinations) || ' destinations';
    
    RETURN result_text;
END;
$$;


ALTER FUNCTION public.recalculate_all_statistics() OWNER TO postgres;

--
-- Name: refresh_materialized_views(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.refresh_materialized_views() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_homepage_statistics;
    RETURN 'Materialized views refreshed successfully';
EXCEPTION
    WHEN OTHERS THEN
        -- Si l'index unique n'existe pas encore, rafraÃ®chir sans CONCURRENTLY
        REFRESH MATERIALIZED VIEW mv_homepage_statistics;
        RETURN 'Materialized views refreshed successfully (non-concurrent)';
END;
$$;


ALTER FUNCTION public.refresh_materialized_views() OWNER TO postgres;

--
-- Name: run_test(character varying, character varying, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.run_test(p_test_name character varying, p_test_category character varying, p_test_query text, p_expected_result text DEFAULT 'true'::text, p_description text DEFAULT ''::text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_start_time TIMESTAMP;
    v_end_time TIMESTAMP;
    v_result TEXT;
    v_status VARCHAR(20);
    v_success BOOLEAN := FALSE;
BEGIN
    v_start_time := clock_timestamp();
    
    -- ExÃ©cuter la requÃªte de test
    EXECUTE p_test_query INTO v_result;
    
    v_end_time := clock_timestamp();
    
    -- DÃ©terminer le statut
    IF v_result = p_expected_result THEN
        v_status := 'PASS';
        v_success := TRUE;
    ELSE
        v_status := 'FAIL';
    END IF;
    
    -- Enregistrer le rÃ©sultat
    INSERT INTO test_results (test_name, test_category, status, message, expected_value, actual_value, execution_time)
    VALUES (p_test_name, p_test_category, v_status, p_description, p_expected_result, v_result, v_end_time - v_start_time);
    
    RETURN v_success;
END;
$$;


ALTER FUNCTION public.run_test(p_test_name character varying, p_test_category character varying, p_test_query text, p_expected_result text, p_description text) OWNER TO postgres;

--
-- Name: search_content(text, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.search_content(search_query text, result_limit integer DEFAULT 10) RETURNS TABLE(result_type text, id integer, name character varying, slug character varying, description character varying, image character varying, original_price numeric, rating numeric, review_count integer, metadata jsonb, relevance real)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sd.result_type,
        sd.id,
        sd.name,
        sd.slug,
        sd.description,
        sd.image,
        sd.original_price,
        sd.rating,
        sd.review_count,
        sd.metadata,
        ts_rank(sd.search_vector, plainto_tsquery('english', search_query)) as relevance
    FROM v_search_data sd
    WHERE sd.search_vector @@ plainto_tsquery('english', search_query)
    ORDER BY relevance DESC, sd.rating DESC
    LIMIT result_limit;
END;
$$;


ALTER FUNCTION public.search_content(search_query text, result_limit integer) OWNER TO postgres;

--
-- Name: update_blog_post_metadata(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_blog_post_metadata() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Calculer le nombre de mots
    IF NEW.content IS NOT NULL THEN
        NEW.word_count := array_length(string_to_array(trim(NEW.content), ' '), 1);
        
        -- Calculer le temps de lecture
        NEW.reading_time := calculate_reading_time(NEW.content);
        
        -- Extraire la table des matiÃ¨res
        NEW.table_of_contents := extract_table_of_contents(NEW.content);
    END IF;
    
    -- GÃ©nÃ©rer l'excerpt si non fourni
    IF NEW.excerpt IS NULL OR NEW.excerpt = '' THEN
        NEW.excerpt := left(regexp_replace(NEW.content, '<[^>]*>', '', 'g'), 300) || '...';
    END IF;
    
    -- DÃ©finir published_at si l'article devient publiÃ©
    IF NEW.is_published = TRUE AND OLD.is_published = FALSE THEN
        NEW.published_at := CURRENT_TIMESTAMP;
    END IF;
    
    -- Mettre Ã  jour updated_at
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_blog_post_metadata() OWNER TO postgres;

--
-- Name: update_category_statistics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_category_statistics() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Mettre Ã  jour l'ancienne catÃ©gorie si elle existe
    IF OLD.category_id IS NOT NULL THEN
        UPDATE tour_categories SET
            active_tour_count = (
                SELECT COUNT(*) FROM tours 
                WHERE category_id = OLD.category_id AND is_active = TRUE
            ),
            total_bookings = (
                SELECT COALESCE(SUM(booking_count), 0) FROM tours 
                WHERE category_id = OLD.category_id AND is_active = TRUE
            ),
            avg_rating = (
                SELECT COALESCE(AVG(rating), 0) FROM tours 
                WHERE category_id = OLD.category_id AND is_active = TRUE AND review_count > 0
            ),
            total_reviews = (
                SELECT COALESCE(SUM(review_count), 0) FROM tours 
                WHERE category_id = OLD.category_id AND is_active = TRUE
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.category_id;
    END IF;
    
    -- Mettre Ã  jour la nouvelle catÃ©gorie si elle existe
    IF NEW.category_id IS NOT NULL THEN
        UPDATE tour_categories SET
            active_tour_count = (
                SELECT COUNT(*) FROM tours 
                WHERE category_id = NEW.category_id AND is_active = TRUE
            ),
            total_bookings = (
                SELECT COALESCE(SUM(booking_count), 0) FROM tours 
                WHERE category_id = NEW.category_id AND is_active = TRUE
            ),
            avg_rating = (
                SELECT COALESCE(AVG(rating), 0) FROM tours 
                WHERE category_id = NEW.category_id AND is_active = TRUE AND review_count > 0
            ),
            total_reviews = (
                SELECT COALESCE(SUM(review_count), 0) FROM tours 
                WHERE category_id = NEW.category_id AND is_active = TRUE
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.category_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_category_statistics() OWNER TO postgres;

--
-- Name: update_destination_metadata(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_destination_metadata() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- GÃ©nÃ©rer le slug si non fourni
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_destination_slug(NEW.name);
    END IF;
    
    -- GÃ©nÃ©rer la description courte si non fournie
    IF NEW.short_description IS NULL OR NEW.short_description = '' THEN
        NEW.short_description := left(regexp_replace(NEW.description, '<[^>]*>', '', 'g'), 200) || '...';
    END IF;
    
    -- Mettre Ã  jour updated_at
    NEW.updated_at := CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_destination_metadata() OWNER TO postgres;

--
-- Name: update_destination_stats(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_destination_stats(dest_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    tour_stats RECORD;
BEGIN
    -- Calculer les statistiques basÃ©es sur les tours liÃ©s
    SELECT 
        COUNT(*) as total_tours,
        COALESCE(SUM(0), 0) as total_bookings,
        COALESCE(AVG(average_rating), 0) as avg_rating,
        COALESCE(SUM(review_count), 0) as review_count,
        COALESCE(MIN(price_per_person), 0) as min_price,
        COALESCE(MAX(price_per_person), 0) as max_price
    INTO tour_stats
    FROM tours 
    WHERE destination_id = dest_id;
    
    -- Mettre Ã  jour la destination
    UPDATE destinations SET
        tour_count = tour_stats.total_tours,
        total_bookings = tour_stats.total_bookings,
        avg_rating = ROUND(tour_stats.avg_rating, 2),
        review_count = tour_stats.review_count,
        price_range_min = tour_stats.min_price,
        price_range_max = tour_stats.max_price,
        budget_category = CASE 
            WHEN tour_stats.max_price <= 5000 THEN 'budget'
            WHEN tour_stats.max_price <= 15000 THEN 'moderate'
            WHEN tour_stats.max_price <= 50000 THEN 'luxury'
            ELSE 'premium'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = dest_id;
END;
$$;


ALTER FUNCTION public.update_destination_stats(dest_id integer) OWNER TO postgres;

--
-- Name: update_gallery_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_gallery_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_gallery_updated_at() OWNER TO postgres;

--
-- Name: update_table_statistics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_table_statistics() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    table_record RECORD;
    result_text TEXT := 'Statistics updated for tables: ';
BEGIN
    -- Analyser toutes les tables principales
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('tours', 'destinations', 'tour_categories', 'blog_posts', 'featured_reviews', 'special_offers', 'homepage_settings')
    LOOP
        EXECUTE 'ANALYZE ' || table_record.tablename;
        result_text := result_text || table_record.tablename || ', ';
    END LOOP;
    
    RETURN rtrim(result_text, ', ');
END;
$$;


ALTER FUNCTION public.update_table_statistics() OWNER TO postgres;

--
-- Name: update_tour_rankings(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_tour_rankings() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- RÃ©initialiser tous les statuts
    UPDATE tour_statistics SET is_trending = FALSE, is_bestseller = FALSE;
    
    -- Marquer les tours trending (top 20% par trend_score)
    WITH trending_tours AS (
        SELECT tour_id,
               PERCENT_RANK() OVER (ORDER BY trend_score DESC) as percentile
        FROM tour_statistics
        WHERE trend_score > 0
    )
    UPDATE tour_statistics 
    SET is_trending = TRUE
    WHERE tour_id IN (
        SELECT tour_id FROM trending_tours WHERE percentile <= 0.2
    );
    
    -- Marquer les bestsellers (top 15% par total_bookings)
    WITH bestseller_tours AS (
        SELECT tour_id,
               PERCENT_RANK() OVER (ORDER BY total_bookings DESC) as percentile
        FROM tour_statistics
        WHERE total_bookings > 0
    )
    UPDATE tour_statistics 
    SET is_bestseller = TRUE
    WHERE tour_id IN (
        SELECT tour_id FROM bestseller_tours WHERE percentile <= 0.15
    );
END;
$$;


ALTER FUNCTION public.update_tour_rankings() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: validate_data_integrity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_data_integrity() RETURNS TABLE(table_name text, issue_description text, affected_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- VÃ©rifier les tours sans catÃ©gorie valide
    RETURN QUERY
    SELECT 'tours'::TEXT, 'Tours with invalid category_id'::TEXT, COUNT(*)
    FROM tours t
    LEFT JOIN tour_categories tc ON t.category_id = tc.id
    WHERE t.category_id IS NOT NULL AND tc.id IS NULL;
    
    -- VÃ©rifier les tours sans destination valide
    -- COMMENTÃ‰: La colonne destination_id n'existe pas dans la table tours
    -- RETURN QUERY
    -- SELECT 'tours'::TEXT, 'Tours with invalid destination_id'::TEXT, COUNT(*)
    -- FROM tours t
    -- LEFT JOIN destinations d ON t.destination_id = d.id
    -- WHERE t.destination_id IS NOT NULL AND d.id IS NULL;
    
    -- VÃ©rifier les avis sans tour valide
    RETURN QUERY
    SELECT 'featured_reviews'::TEXT, 'Reviews with invalid tour_id'::TEXT, COUNT(*)
    FROM featured_reviews fr
    LEFT JOIN tours t ON fr.tour_id = t.id
    WHERE fr.tour_id IS NOT NULL AND t.id IS NULL;
    
    -- VÃ©rifier les destinations avec parent invalide
    RETURN QUERY
    SELECT 'destinations'::TEXT, 'Destinations with invalid parent_destination_id'::TEXT, COUNT(*)
    FROM destinations d1
    LEFT JOIN destinations d2 ON d1.parent_destination_id = d2.id
    WHERE d1.parent_destination_id IS NOT NULL AND d2.id IS NULL;
    
    -- VÃ©rifier les prix incohÃ©rents
    -- COMMENTÃ‰: La colonne price n'existe pas dans la table tours
    -- RETURN QUERY
    -- SELECT 'tours'::TEXT, 'Tours with price > original_price'::TEXT, COUNT(*)
    -- FROM tours
    -- WHERE price > original_price;
    
    -- VÃ©rifier les ratings invalides
    RETURN QUERY
    SELECT 'tours'::TEXT, 'Tours with invalid ratings'::TEXT, COUNT(*)
    FROM tours
    WHERE rating < 0 OR rating > 5;
    
    RETURN;
END;
$$;


ALTER FUNCTION public.validate_data_integrity() OWNER TO postgres;

--
-- Name: addons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addons (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    description text
);


ALTER TABLE public.addons OWNER TO postgres;

--
-- Name: addons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.addons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addons_id_seq OWNER TO postgres;

--
-- Name: addons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.addons_id_seq OWNED BY public.addons.id;


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_events (
    id integer NOT NULL,
    event_type character varying(50) NOT NULL,
    user_id integer,
    session_id character varying(255),
    page_url text,
    referrer text,
    user_agent text,
    ip_address inet,
    country character varying(100),
    city character varying(100),
    device_type character varying(50),
    browser character varying(50),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.analytics_events OWNER TO postgres;

--
-- Name: TABLE analytics_events; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.analytics_events IS 'User behavior and system events tracking';


--
-- Name: COLUMN analytics_events.metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics_events.metadata IS 'Flexible JSON storage for event-specific data';


--
-- Name: analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analytics_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analytics_events_id_seq OWNER TO postgres;

--
-- Name: analytics_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analytics_events_id_seq OWNED BY public.analytics_events.id;


--
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    content text,
    excerpt character varying(500),
    main_image_url character varying(255),
    author_id integer,
    status character varying(20) DEFAULT 'published'::character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO postgres;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    admin_user_id integer,
    action character varying(50) NOT NULL,
    target_entity character varying(50) NOT NULL,
    entity_id integer,
    details jsonb,
    ip_address inet,
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_action CHECK (((action)::text = ANY (ARRAY[('CREATE'::character varying)::text, ('UPDATE'::character varying)::text, ('DELETE'::character varying)::text, ('APPROVE'::character varying)::text, ('REJECT'::character varying)::text, ('TOGGLE_STATUS'::character varying)::text, ('LINK'::character varying)::text, ('UNLINK'::character varying)::text, ('LOGIN'::character varying)::text, ('LOGOUT'::character varying)::text]))),
    CONSTRAINT chk_target_entity CHECK (((target_entity)::text = ANY (ARRAY[('Tour'::character varying)::text, ('User'::character varying)::text, ('Vehicle'::character varying)::text, ('AddOn'::character varying)::text, ('PackageTier'::character varying)::text, ('Review'::character varying)::text, ('PasswordReset'::character varying)::text, ('TourAddOn'::character varying)::text, ('Booking'::character varying)::text])))
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: TABLE audit_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.audit_logs IS 'Audit trail for all administrative actions';


--
-- Name: COLUMN audit_logs.admin_user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_logs.admin_user_id IS 'ID of the admin who performed the action';


--
-- Name: COLUMN audit_logs.action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_logs.action IS 'Type of action performed';


--
-- Name: COLUMN audit_logs.target_entity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_logs.target_entity IS 'Type of entity that was affected';


--
-- Name: COLUMN audit_logs.entity_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_logs.entity_id IS 'ID of the specific entity affected';


--
-- Name: COLUMN audit_logs.details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_logs.details IS 'JSON object with additional details about the action';


--
-- Name: COLUMN audit_logs.ip_address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_logs.ip_address IS 'IP address from which the action was performed';


--
-- Name: COLUMN audit_logs.user_agent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_logs.user_agent IS 'Browser user agent string';


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: auditlogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditlogs (
    id integer NOT NULL,
    admin_user_id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    target_entity character varying(50) NOT NULL,
    target_id integer,
    details jsonb,
    "timestamp" timestamp with time zone DEFAULT now()
);


ALTER TABLE public.auditlogs OWNER TO postgres;

--
-- Name: auditlogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditlogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditlogs_id_seq OWNER TO postgres;

--
-- Name: auditlogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditlogs_id_seq OWNED BY public.auditlogs.id;


--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blog_categories OWNER TO postgres;

--
-- Name: TABLE blog_categories; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.blog_categories IS 'Categories for organizing blog posts';


--
-- Name: blog_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_categories_id_seq OWNER TO postgres;

--
-- Name: blog_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_categories_id_seq OWNED BY public.blog_categories.id;


--
-- Name: blog_post_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_post_categories (
    blog_post_id integer NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.blog_post_categories OWNER TO postgres;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    content text NOT NULL,
    excerpt text,
    featured_image_url text,
    author_id integer,
    status character varying(20) DEFAULT 'draft'::character varying,
    tags text[],
    meta_title character varying(255),
    meta_description text,
    read_time integer,
    view_count integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    featured_image character varying(255),
    thumbnail_image character varying(255),
    category character varying(100) DEFAULT 'General'::character varying,
    is_published boolean DEFAULT true,
    display_order integer DEFAULT 0,
    reading_time integer DEFAULT 5,
    word_count integer DEFAULT 0,
    language character varying(5) DEFAULT 'en'::character varying,
    like_count integer DEFAULT 0,
    share_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    meta_keywords character varying(500),
    canonical_url character varying(500),
    og_image character varying(255),
    scheduled_at timestamp without time zone,
    last_modified_by integer,
    related_tours integer[],
    related_destinations integer[],
    related_posts integer[],
    table_of_contents jsonb DEFAULT '[]'::jsonb,
    gallery_images text[],
    video_urls text[],
    avg_rating numeric(3,2) DEFAULT 0.00,
    rating_count integer DEFAULT 0,
    bounce_rate numeric(5,2) DEFAULT 0.00,
    avg_time_on_page integer DEFAULT 0,
    moderation_status character varying(20) DEFAULT 'approved'::character varying,
    moderated_by integer,
    moderated_at timestamp without time zone,
    notify_subscribers boolean DEFAULT false,
    newsletter_sent boolean DEFAULT false,
    social_media_posted boolean DEFAULT false,
    CONSTRAINT blog_posts_moderation_status_check CHECK (((moderation_status)::text = ANY ((ARRAY['draft'::character varying, 'pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT blog_posts_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('published'::character varying)::text, ('archived'::character varying)::text]))),
    CONSTRAINT chk_blog_posts_counts_positive CHECK (((view_count >= 0) AND (like_count >= 0) AND (share_count >= 0) AND (comment_count >= 0) AND (word_count >= 0) AND (reading_time > 0))),
    CONSTRAINT chk_blog_posts_rates_valid CHECK (((bounce_rate >= (0)::numeric) AND (bounce_rate <= (100)::numeric) AND (avg_time_on_page >= 0))),
    CONSTRAINT chk_blog_posts_rating_valid CHECK (((avg_rating >= (0)::numeric) AND (avg_rating <= (5)::numeric) AND (rating_count >= 0)))
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: TABLE blog_posts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.blog_posts IS 'Blog posts for content marketing and SEO';


--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO postgres;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tour_id integer NOT NULL,
    package_tier_id integer NOT NULL,
    travel_date date NOT NULL,
    number_of_persons integer NOT NULL,
    additional_vehicles jsonb,
    selected_addons jsonb,
    status character varying(50) DEFAULT 'Inquiry Pending'::character varying NOT NULL,
    payment_timestamp timestamp with time zone,
    total_price numeric(12,2),
    selected_currency character varying(3) DEFAULT 'INR'::character varying,
    inquiry_date timestamp with time zone DEFAULT now(),
    customer_notes text,
    admin_notes text,
    cancellation_reason text,
    cancelled_at timestamp without time zone,
    confirmed_at timestamp without time zone
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: contact_inquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_inquiries (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    subject character varying(255),
    message text NOT NULL,
    inquiry_type character varying(50) DEFAULT 'general'::character varying,
    status character varying(20) DEFAULT 'new'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    assigned_to integer,
    response_sent boolean DEFAULT false,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contact_inquiries_priority_check CHECK (((priority)::text = ANY (ARRAY[('low'::character varying)::text, ('medium'::character varying)::text, ('high'::character varying)::text, ('urgent'::character varying)::text]))),
    CONSTRAINT contact_inquiries_status_check CHECK (((status)::text = ANY (ARRAY[('new'::character varying)::text, ('in_progress'::character varying)::text, ('resolved'::character varying)::text, ('closed'::character varying)::text])))
);


ALTER TABLE public.contact_inquiries OWNER TO postgres;

--
-- Name: TABLE contact_inquiries; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.contact_inquiries IS 'Customer contact form submissions and inquiries';


--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_inquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_inquiries_id_seq OWNER TO postgres;

--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_inquiries_id_seq OWNED BY public.contact_inquiries.id;


--
-- Name: dashboard_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_metrics (
    id integer NOT NULL,
    metric_name character varying(100) NOT NULL,
    metric_value numeric(15,2),
    metric_date date NOT NULL,
    period_type character varying(20) NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dashboard_metrics OWNER TO postgres;

--
-- Name: TABLE dashboard_metrics; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.dashboard_metrics IS 'Aggregated metrics for admin dashboard';


--
-- Name: dashboard_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dashboard_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dashboard_metrics_id_seq OWNER TO postgres;

--
-- Name: dashboard_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dashboard_metrics_id_seq OWNED BY public.dashboard_metrics.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer NOT NULL,
    tour_id integer NOT NULL,
    rating integer NOT NULL,
    review_text text,
    is_approved boolean DEFAULT false,
    submission_date timestamp with time zone DEFAULT now(),
    helpful_count integer DEFAULT 0,
    images text[],
    verified_purchase boolean DEFAULT false,
    response_from_admin text,
    responded_at timestamp without time zone,
    travel_date date,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'client'::character varying NOT NULL,
    is_verified boolean DEFAULT false,
    verification_token text,
    phone character varying(30),
    country character varying(100),
    creation_date timestamp with time zone DEFAULT now(),
    recent_activities jsonb,
    activity_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    profile_image_url text,
    preferences jsonb
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.recent_activities; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.recent_activities IS 'JSON array of recent user activities';


--
-- Name: dashboard_overview; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.dashboard_overview AS
 SELECT ( SELECT count(*) AS count
           FROM public.users
          WHERE (COALESCE(users.is_active, true) = true)) AS active_users,
    ( SELECT count(*) AS count
           FROM public.bookings
          WHERE ((bookings.status)::text = 'Inquiry Pending'::text)) AS pending_inquiries,
    ( SELECT count(*) AS count
           FROM public.bookings
          WHERE ((bookings.status)::text = 'Payment Confirmed'::text)) AS confirmed_bookings,
    ( SELECT COALESCE(sum(bookings.total_price), (0)::numeric) AS "coalesce"
           FROM public.bookings
          WHERE ((bookings.status)::text = 'Payment Confirmed'::text)) AS total_revenue,
    ( SELECT count(*) AS count
           FROM public.tours
          WHERE (COALESCE(tours.is_active, true) = true)) AS active_tours,
    ( SELECT count(*) AS count
           FROM public.reviews
          WHERE (COALESCE(reviews.is_approved, false) = true)) AS approved_reviews,
    ( SELECT count(*) AS count
           FROM public.contact_inquiries
          WHERE ((contact_inquiries.status)::text = 'new'::text)) AS new_inquiries;


ALTER VIEW public.dashboard_overview OWNER TO postgres;

--
-- Name: destination_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(100),
    color character varying(7),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.destination_categories OWNER TO postgres;

--
-- Name: destination_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destination_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destination_categories_id_seq OWNER TO postgres;

--
-- Name: destination_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destination_categories_id_seq OWNED BY public.destination_categories.id;


--
-- Name: destination_category_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_category_assignments (
    destination_id integer NOT NULL,
    category_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.destination_category_assignments OWNER TO postgres;

--
-- Name: destination_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    destination_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.destination_likes OWNER TO postgres;

--
-- Name: destination_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destination_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destination_likes_id_seq OWNER TO postgres;

--
-- Name: destination_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destination_likes_id_seq OWNED BY public.destination_likes.id;


--
-- Name: destination_seasons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destination_seasons (
    id integer NOT NULL,
    destination_id integer NOT NULL,
    season character varying(50) NOT NULL,
    is_ideal boolean DEFAULT false,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.destination_seasons OWNER TO postgres;

--
-- Name: destination_seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destination_seasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destination_seasons_id_seq OWNER TO postgres;

--
-- Name: destination_seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destination_seasons_id_seq OWNED BY public.destination_seasons.id;


--
-- Name: destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.destinations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    country character varying(100),
    description text,
    main_image_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    slug character varying(255),
    short_description text,
    featured_image character varying(255),
    thumbnail_image character varying(255),
    gallery_images text[],
    video_url character varying(500),
    latitude numeric(10,8),
    longitude numeric(11,8),
    state character varying(100),
    region character varying(100),
    timezone character varying(50) DEFAULT 'Asia/Kolkata'::character varying,
    is_featured boolean DEFAULT false,
    is_popular boolean DEFAULT false,
    is_trending boolean DEFAULT false,
    display_order integer DEFAULT 0,
    best_time_to_visit character varying(500),
    climate_info text,
    local_language character varying(100),
    currency character varying(10) DEFAULT 'INR'::character varying,
    time_zone_offset character varying(10) DEFAULT '+05:30'::character varying,
    top_attractions text[],
    activities text[],
    specialties text[],
    cultural_highlights text[],
    how_to_reach text,
    nearest_airport character varying(255),
    nearest_railway character varying(255),
    local_transport text,
    accommodation_types text[],
    tour_count integer DEFAULT 0,
    total_bookings integer DEFAULT 0,
    avg_rating numeric(3,2) DEFAULT 0.00,
    review_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    wishlist_count integer DEFAULT 0,
    price_range_min numeric(10,2) DEFAULT 0,
    price_range_max numeric(10,2) DEFAULT 0,
    budget_category character varying(20) DEFAULT 'moderate'::character varying,
    meta_title character varying(255),
    meta_description text,
    meta_keywords character varying(500),
    canonical_url character varying(500),
    og_image character varying(255),
    peak_season character varying(100),
    off_season character varying(100),
    festivals_events jsonb DEFAULT '[]'::jsonb,
    weather_data jsonb DEFAULT '{}'::jsonb,
    recommended_duration character varying(50),
    difficulty_level character varying(20) DEFAULT 'easy'::character varying,
    family_friendly boolean DEFAULT true,
    adventure_level character varying(20) DEFAULT 'low'::character varying,
    eco_friendly boolean DEFAULT false,
    unesco_site boolean DEFAULT false,
    heritage_site boolean DEFAULT false,
    wildlife_sanctuary boolean DEFAULT false,
    related_destinations integer[],
    nearby_destinations integer[],
    parent_destination_id integer,
    travel_tips text,
    local_customs text,
    safety_info text,
    packing_suggestions text[],
    conversion_rate numeric(5,2) DEFAULT 0.00,
    bounce_rate numeric(5,2) DEFAULT 0.00,
    avg_session_duration integer DEFAULT 0,
    CONSTRAINT chk_destinations_coordinates_valid CHECK ((((latitude IS NULL) AND (longitude IS NULL)) OR ((latitude IS NOT NULL) AND (longitude IS NOT NULL) AND (latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric) AND (longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric)))),
    CONSTRAINT chk_destinations_counts_positive CHECK (((tour_count >= 0) AND (total_bookings >= 0) AND (review_count >= 0) AND (view_count >= 0) AND (wishlist_count >= 0))),
    CONSTRAINT chk_destinations_price_range_valid CHECK (((price_range_min >= (0)::numeric) AND (price_range_max >= (0)::numeric) AND (price_range_max >= price_range_min))),
    CONSTRAINT chk_destinations_rates_valid CHECK (((conversion_rate >= (0)::numeric) AND (conversion_rate <= (100)::numeric) AND (bounce_rate >= (0)::numeric) AND (bounce_rate <= (100)::numeric))),
    CONSTRAINT chk_destinations_rating_valid CHECK (((avg_rating >= (0)::numeric) AND (avg_rating <= (5)::numeric))),
    CONSTRAINT destinations_adventure_level_check CHECK (((adventure_level)::text = ANY ((ARRAY['low'::character varying, 'moderate'::character varying, 'high'::character varying, 'extreme'::character varying])::text[]))),
    CONSTRAINT destinations_budget_category_check CHECK (((budget_category)::text = ANY ((ARRAY['budget'::character varying, 'moderate'::character varying, 'luxury'::character varying, 'premium'::character varying])::text[]))),
    CONSTRAINT destinations_difficulty_level_check CHECK (((difficulty_level)::text = ANY ((ARRAY['easy'::character varying, 'moderate'::character varying, 'challenging'::character varying, 'expert'::character varying])::text[])))
);


ALTER TABLE public.destinations OWNER TO postgres;

--
-- Name: tour_destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_destinations (
    tour_id integer NOT NULL,
    destination_id integer NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.tour_destinations OWNER TO postgres;

--
-- Name: destination_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.destination_stats AS
 SELECT d.id,
    d.name,
    d.country,
    d.main_image_url,
    count(DISTINCT td.tour_id) AS tour_count,
    COALESCE(avg(r.rating), (0)::numeric) AS average_rating,
    count(DISTINCT r.id) AS review_count,
    count(DISTINCT dl.user_id) AS like_count,
    count(DISTINCT b.id) AS booking_count
   FROM (((((public.destinations d
     LEFT JOIN public.tour_destinations td ON ((d.id = td.destination_id)))
     LEFT JOIN public.tours t ON (((td.tour_id = t.id) AND (t.is_active = true))))
     LEFT JOIN public.reviews r ON (((t.id = r.tour_id) AND (r.is_approved = true))))
     LEFT JOIN public.destination_likes dl ON ((d.id = dl.destination_id)))
     LEFT JOIN public.bookings b ON (((t.id = b.tour_id) AND ((b.status)::text = 'Payment Confirmed'::text))))
  WHERE (d.is_active = true)
  GROUP BY d.id, d.name, d.country, d.main_image_url;


ALTER VIEW public.destination_stats OWNER TO postgres;

--
-- Name: destinations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.destinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.destinations_id_seq OWNER TO postgres;

--
-- Name: destinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.destinations_id_seq OWNED BY public.destinations.id;


--
-- Name: featured_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.featured_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.featured_reviews_id_seq OWNER TO postgres;

--
-- Name: featured_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.featured_reviews_id_seq OWNED BY public.featured_reviews.id;


--
-- Name: gallery_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gallery_images (
    id uuid NOT NULL,
    title text NOT NULL,
    description text,
    location text,
    category text,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    filename text NOT NULL,
    path text NOT NULL,
    views integer DEFAULT 0,
    thumbnail_path character varying(255),
    tags text[],
    is_featured boolean DEFAULT false,
    color_palette jsonb,
    aspect_ratio numeric(4,2),
    blur_hash text,
    file_size integer,
    dimensions jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gallery_images OWNER TO postgres;

--
-- Name: COLUMN gallery_images.tags; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gallery_images.tags IS 'Tags pour filtrage et recherche avancée';


--
-- Name: COLUMN gallery_images.is_featured; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gallery_images.is_featured IS 'Images mises en avant dans la galerie';


--
-- Name: COLUMN gallery_images.color_palette; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gallery_images.color_palette IS 'Palette de couleurs dominantes de l''image';


--
-- Name: COLUMN gallery_images.aspect_ratio; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gallery_images.aspect_ratio IS 'Ratio largeur/hauteur pour layout masonry';


--
-- Name: COLUMN gallery_images.blur_hash; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gallery_images.blur_hash IS 'Hash pour placeholder pendant le chargement';


--
-- Name: COLUMN gallery_images.dimensions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gallery_images.dimensions IS 'Dimensions réelles de l''image {width, height}';


--
-- Name: homepage_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.homepage_settings (
    id integer NOT NULL,
    section_name character varying(100) NOT NULL,
    section_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    title character varying(200),
    subtitle character varying(300),
    description text,
    background_image character varying(255),
    background_color character varying(7),
    text_color character varying(7),
    accent_color character varying(7),
    section_config jsonb DEFAULT '{}'::jsonb,
    max_items integer DEFAULT 6,
    items_per_row integer DEFAULT 3,
    mobile_items_per_row integer DEFAULT 1,
    animation_type character varying(50) DEFAULT 'fade-in'::character varying,
    animation_duration integer DEFAULT 500,
    animation_delay integer DEFAULT 0,
    hide_on_mobile boolean DEFAULT false,
    hide_on_tablet boolean DEFAULT false,
    hide_on_desktop boolean DEFAULT false,
    meta_title character varying(255),
    meta_description text,
    cache_duration integer DEFAULT 3600,
    last_cache_refresh timestamp without time zone,
    ab_test_variant character varying(50),
    ab_test_active boolean DEFAULT false,
    view_count integer DEFAULT 0,
    click_count integer DEFAULT 0,
    conversion_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_animation_duration CHECK (((animation_duration >= 0) AND (animation_duration <= 5000))),
    CONSTRAINT chk_cache_duration CHECK (((cache_duration >= 0) AND (cache_duration <= 86400))),
    CONSTRAINT chk_items_per_row CHECK (((items_per_row > 0) AND (items_per_row <= 12))),
    CONSTRAINT chk_max_items CHECK (((max_items > 0) AND (max_items <= 50))),
    CONSTRAINT chk_mobile_items_per_row CHECK (((mobile_items_per_row > 0) AND (mobile_items_per_row <= 6)))
);


ALTER TABLE public.homepage_settings OWNER TO postgres;

--
-- Name: homepage_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.homepage_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.homepage_settings_id_seq OWNER TO postgres;

--
-- Name: homepage_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.homepage_settings_id_seq OWNED BY public.homepage_settings.id;


--
-- Name: inclusions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inclusions (
    id integer NOT NULL,
    package_tier_id integer NOT NULL,
    description text NOT NULL,
    is_included boolean NOT NULL
);


ALTER TABLE public.inclusions OWNER TO postgres;

--
-- Name: inclusions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inclusions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inclusions_id_seq OWNER TO postgres;

--
-- Name: inclusions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inclusions_id_seq OWNED BY public.inclusions.id;


--
-- Name: migration_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migration_log (
    id integer NOT NULL,
    script_name character varying(255) NOT NULL,
    execution_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) NOT NULL,
    error_message text,
    execution_duration_seconds integer,
    affected_rows integer DEFAULT 0,
    CONSTRAINT migration_log_status_check CHECK (((status)::text = ANY ((ARRAY['started'::character varying, 'completed'::character varying, 'failed'::character varying, 'rolled_back'::character varying])::text[])))
);


ALTER TABLE public.migration_log OWNER TO postgres;

--
-- Name: migration_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migration_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migration_log_id_seq OWNER TO postgres;

--
-- Name: migration_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migration_log_id_seq OWNED BY public.migration_log.id;


--
-- Name: mv_homepage_statistics; Type: MATERIALIZED VIEW; Schema: public; Owner: postgres
--

CREATE MATERIALIZED VIEW public.mv_homepage_statistics AS
 SELECT 'tours'::text AS entity_type,
    count(*) AS total_count,
    count(*) FILTER (WHERE (tours.is_active = true)) AS active_count,
    count(*) FILTER (WHERE (tours.is_featured = true)) AS featured_count,
    count(*) FILTER (WHERE (tours.is_bestseller = true)) AS bestseller_count,
    count(*) FILTER (WHERE (tours.is_trending = true)) AS trending_count,
    round(avg(tours.rating), 2) AS avg_rating,
    sum(tours.booking_count) AS total_bookings,
    sum(tours.view_count) AS total_views
   FROM public.tours
UNION ALL
 SELECT 'destinations'::text AS entity_type,
    count(*) AS total_count,
    count(*) FILTER (WHERE (destinations.tour_count > 0)) AS active_count,
    count(*) FILTER (WHERE (destinations.is_featured = true)) AS featured_count,
    count(*) FILTER (WHERE (destinations.is_popular = true)) AS bestseller_count,
    count(*) FILTER (WHERE (destinations.is_trending = true)) AS trending_count,
    round(avg(destinations.avg_rating), 2) AS avg_rating,
    sum(destinations.total_bookings) AS total_bookings,
    sum(destinations.view_count) AS total_views
   FROM public.destinations
UNION ALL
 SELECT 'blog_posts'::text AS entity_type,
    count(*) AS total_count,
    count(*) FILTER (WHERE (blog_posts.is_published = true)) AS active_count,
    count(*) FILTER (WHERE (blog_posts.is_featured = true)) AS featured_count,
    0 AS bestseller_count,
    0 AS trending_count,
    round(avg(blog_posts.avg_rating), 2) AS avg_rating,
    0 AS total_bookings,
    sum(blog_posts.view_count) AS total_views
   FROM public.blog_posts
  WITH NO DATA;


ALTER MATERIALIZED VIEW public.mv_homepage_statistics OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    subject character varying(255),
    email_template text,
    sms_template text,
    push_template text,
    variables jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: TABLE notification_templates; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notification_templates IS 'Email and notification templates';


--
-- Name: notification_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_templates_id_seq OWNER TO postgres;

--
-- Name: notification_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_templates_id_seq OWNED BY public.notification_templates.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    booking_id integer,
    type character varying(50) NOT NULL,
    channel character varying(20) DEFAULT 'email'::character varying NOT NULL,
    status character varying(20) NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    template_id integer,
    priority character varying(20) DEFAULT 'medium'::character varying,
    scheduled_at timestamp without time zone,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    metadata jsonb,
    title character varying(255),
    message text,
    is_read boolean DEFAULT false,
    CONSTRAINT notifications_priority_check CHECK (((priority)::text = ANY (ARRAY[('low'::character varying)::text, ('medium'::character varying)::text, ('high'::character varying)::text, ('urgent'::character varying)::text])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: packagetiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packagetiers (
    id integer NOT NULL,
    tour_id integer NOT NULL,
    tier_name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    hotel_type character varying(255),
    included_vehicle_id integer,
    inclusions_summary text[]
);


ALTER TABLE public.packagetiers OWNER TO postgres;

--
-- Name: packagetiers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.packagetiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.packagetiers_id_seq OWNER TO postgres;

--
-- Name: packagetiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.packagetiers_id_seq OWNED BY public.packagetiers.id;


--
-- Name: passwordresets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passwordresets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    reset_token text,
    expires_at timestamp with time zone,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    email character varying(100) NOT NULL
);


ALTER TABLE public.passwordresets OWNER TO postgres;

--
-- Name: passwordresets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.passwordresets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.passwordresets_id_seq OWNER TO postgres;

--
-- Name: passwordresets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.passwordresets_id_seq OWNED BY public.passwordresets.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    gateway_transaction_id character varying(255),
    amount numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    status character varying(50) NOT NULL,
    payment_date timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: review_helpfulness; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_helpfulness (
    id integer NOT NULL,
    review_id integer,
    user_id integer,
    is_helpful boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.review_helpfulness OWNER TO postgres;

--
-- Name: TABLE review_helpfulness; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.review_helpfulness IS 'User votes on review helpfulness';


--
-- Name: review_helpfulness_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_helpfulness_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_helpfulness_id_seq OWNER TO postgres;

--
-- Name: review_helpfulness_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_helpfulness_id_seq OWNED BY public.review_helpfulness.id;


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: security_logs; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.security_logs AS
 SELECT a.id,
    a.action AS event_type,
    concat(a.action, ' ', a.target_entity,
        CASE
            WHEN (a.entity_id IS NOT NULL) THEN concat(' #', a.entity_id)
            ELSE ''::text
        END) AS description,
    u.email AS user_email,
    u.role AS user_role,
    a."timestamp",
    a.ip_address,
    'Unknown'::text AS location,
    a.details,
    u.full_name AS admin_name
   FROM (public.audit_logs a
     LEFT JOIN public.users u ON ((a.admin_user_id = u.id)))
  ORDER BY a."timestamp" DESC;


ALTER VIEW public.security_logs OWNER TO postgres;

--
-- Name: special_offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_offers (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    slug character varying(200) NOT NULL,
    description text,
    short_description character varying(500),
    offer_type character varying(50) DEFAULT 'percentage'::character varying,
    discount_percentage numeric(5,2),
    discount_amount numeric(10,2),
    min_booking_amount numeric(10,2),
    max_discount_amount numeric(10,2),
    valid_from timestamp without time zone NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    usage_limit_per_user integer DEFAULT 1,
    promo_code character varying(50),
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    is_homepage_banner boolean DEFAULT false,
    display_order integer DEFAULT 0,
    banner_image character varying(255),
    thumbnail_image character varying(255),
    background_color character varying(7) DEFAULT '#FF6B6B'::character varying,
    text_color character varying(7) DEFAULT '#FFFFFF'::character varying,
    terms_conditions text,
    internal_notes text,
    view_count integer DEFAULT 0,
    click_count integer DEFAULT 0,
    conversion_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_discount_values CHECK (((((offer_type)::text = 'percentage'::text) AND (discount_percentage IS NOT NULL) AND (discount_percentage > (0)::numeric) AND (discount_percentage <= (100)::numeric)) OR (((offer_type)::text = 'fixed_amount'::text) AND (discount_amount IS NOT NULL) AND (discount_amount > (0)::numeric)) OR ((offer_type)::text = ANY ((ARRAY['buy_one_get_one'::character varying, 'early_bird'::character varying, 'last_minute'::character varying, 'seasonal'::character varying])::text[])))),
    CONSTRAINT chk_special_offers_dates_valid CHECK ((valid_until >= valid_from)),
    CONSTRAINT chk_special_offers_discount_valid CHECK (((((offer_type)::text = 'percentage'::text) AND (discount_percentage >= (0)::numeric) AND (discount_percentage <= (100)::numeric)) OR (((offer_type)::text = 'fixed_amount'::text) AND (discount_amount >= (0)::numeric)) OR ((offer_type)::text = ANY ((ARRAY['buy_one_get_one'::character varying, 'early_bird'::character varying, 'last_minute'::character varying, 'group_discount'::character varying, 'seasonal'::character varying])::text[])))),
    CONSTRAINT chk_special_offers_usage_valid CHECK (((usage_count >= 0) AND (usage_limit >= 0))),
    CONSTRAINT chk_usage_limits CHECK (((usage_limit IS NULL) OR (usage_limit > 0))),
    CONSTRAINT chk_valid_dates CHECK ((valid_from < valid_until)),
    CONSTRAINT special_offers_offer_type_check CHECK (((offer_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed_amount'::character varying, 'buy_one_get_one'::character varying, 'early_bird'::character varying, 'last_minute'::character varying, 'seasonal'::character varying])::text[])))
);


ALTER TABLE public.special_offers OWNER TO postgres;

--
-- Name: special_offers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.special_offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.special_offers_id_seq OWNER TO postgres;

--
-- Name: special_offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.special_offers_id_seq OWNED BY public.special_offers.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    data_type character varying(20) DEFAULT 'string'::character varying,
    description text,
    is_public boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_settings_data_type_check CHECK (((data_type)::text = ANY (ARRAY[('string'::character varying)::text, ('number'::character varying)::text, ('boolean'::character varying)::text, ('json'::character varying)::text])))
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: TABLE system_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_settings IS 'System-wide configuration settings';


--
-- Name: COLUMN system_settings.is_public; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_settings.is_public IS 'Whether setting can be accessed by frontend';


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: test_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_results (
    id integer NOT NULL,
    test_name character varying(255) NOT NULL,
    test_category character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    message text,
    expected_value text,
    actual_value text,
    execution_time interval,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT test_results_status_check CHECK (((status)::text = ANY ((ARRAY['PASS'::character varying, 'FAIL'::character varying, 'WARNING'::character varying])::text[])))
);


ALTER TABLE public.test_results OWNER TO postgres;

--
-- Name: test_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.test_results_id_seq OWNER TO postgres;

--
-- Name: test_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test_results_id_seq OWNED BY public.test_results.id;


--
-- Name: tour_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(50) DEFAULT 'fa-map'::character varying,
    color_theme character varying(7) DEFAULT '#007bff'::character varying,
    image character varying(255),
    meta_title character varying(255),
    meta_description text,
    meta_keywords character varying(500),
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    is_popular boolean DEFAULT false,
    display_order integer DEFAULT 0,
    active_tour_count integer DEFAULT 0,
    total_bookings integer DEFAULT 0,
    avg_rating numeric(3,2) DEFAULT 0.00,
    min_price numeric(10,2),
    max_price numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tour_categories_counts_positive CHECK (((active_tour_count >= 0) AND (total_bookings >= 0))),
    CONSTRAINT chk_tour_categories_price_valid CHECK (((min_price >= (0)::numeric) AND (max_price >= (0)::numeric) AND (max_price >= min_price))),
    CONSTRAINT chk_tour_categories_rating_valid CHECK (((avg_rating >= (0)::numeric) AND (avg_rating <= (5)::numeric)))
);


ALTER TABLE public.tour_categories OWNER TO postgres;

--
-- Name: tour_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tour_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tour_categories_id_seq OWNER TO postgres;

--
-- Name: tour_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tour_categories_id_seq OWNED BY public.tour_categories.id;


--
-- Name: tour_exclusions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_exclusions (
    id integer NOT NULL,
    tour_id integer,
    title character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tour_exclusions OWNER TO postgres;

--
-- Name: TABLE tour_exclusions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tour_exclusions IS 'What is not included in tour packages';


--
-- Name: tour_exclusions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tour_exclusions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tour_exclusions_id_seq OWNER TO postgres;

--
-- Name: tour_exclusions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tour_exclusions_id_seq OWNED BY public.tour_exclusions.id;


--
-- Name: tour_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_images (
    id integer NOT NULL,
    tour_id integer,
    image_url text NOT NULL,
    caption text,
    is_primary boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tour_images OWNER TO postgres;

--
-- Name: TABLE tour_images; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tour_images IS 'Additional images for tours';


--
-- Name: tour_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tour_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tour_images_id_seq OWNER TO postgres;

--
-- Name: tour_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tour_images_id_seq OWNED BY public.tour_images.id;


--
-- Name: tour_inclusions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tour_inclusions (
    id integer NOT NULL,
    tour_id integer,
    inclusion_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    icon character varying(50),
    is_included boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tour_inclusions OWNER TO postgres;

--
-- Name: TABLE tour_inclusions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tour_inclusions IS 'What is included in tour packages';


--
-- Name: tour_inclusions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tour_inclusions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tour_inclusions_id_seq OWNER TO postgres;

--
-- Name: tour_inclusions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tour_inclusions_id_seq OWNED BY public.tour_inclusions.id;


--
-- Name: tour_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tour_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tour_statistics_id_seq OWNER TO postgres;

--
-- Name: tour_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tour_statistics_id_seq OWNED BY public.tour_statistics.id;


--
-- Name: touraddons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.touraddons (
    tour_id integer NOT NULL,
    addon_id integer NOT NULL
);


ALTER TABLE public.touraddons OWNER TO postgres;

--
-- Name: tours_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tours_id_seq OWNER TO postgres;

--
-- Name: tours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tours_id_seq OWNED BY public.tours.id;


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_favorites (
    id integer NOT NULL,
    user_id integer,
    tour_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_favorites OWNER TO postgres;

--
-- Name: TABLE user_favorites; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_favorites IS 'User favorite tours';


--
-- Name: user_activity_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_activity_summary AS
 SELECT u.id,
    u.full_name,
    u.email,
    COALESCE(u.is_active, true) AS is_active,
    u.last_login,
    count(b.id) AS total_bookings,
    count(r.id) AS total_reviews,
    count(uf.id) AS favorite_tours,
    COALESCE(u.activity_count, 0) AS activity_count
   FROM (((public.users u
     LEFT JOIN public.bookings b ON ((u.id = b.user_id)))
     LEFT JOIN public.reviews r ON ((u.id = r.user_id)))
     LEFT JOIN public.user_favorites uf ON ((u.id = uf.user_id)))
  GROUP BY u.id, u.full_name, u.email, u.is_active, u.last_login, u.activity_count;


ALTER VIEW public.user_activity_summary OWNER TO postgres;

--
-- Name: user_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_favorites_id_seq OWNER TO postgres;

--
-- Name: user_favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_favorites_id_seq OWNED BY public.user_favorites.id;


--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_preferences (
    id integer NOT NULL,
    user_id integer,
    preference_key character varying(100) NOT NULL,
    preference_value text,
    data_type character varying(20) DEFAULT 'string'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_preferences_data_type_check CHECK (((data_type)::text = ANY (ARRAY[('string'::character varying)::text, ('number'::character varying)::text, ('boolean'::character varying)::text, ('json'::character varying)::text])))
);


ALTER TABLE public.user_preferences OWNER TO postgres;

--
-- Name: TABLE user_preferences; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_preferences IS 'User-specific preferences and settings';


--
-- Name: user_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_preferences_id_seq OWNER TO postgres;

--
-- Name: user_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_preferences_id_seq OWNED BY public.user_preferences.id;


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: v_homepage_data; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_homepage_data AS
 SELECT 'hero_banner'::text AS section_type,
    1 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'description', hs.description, 'background_image', hs.background_image, 'cta_text', (hs.section_config ->> 'cta_text'::text), 'cta_link', (hs.section_config ->> 'cta_link'::text), 'overlay_opacity', (hs.section_config ->> 'overlay_opacity'::text), 'text_alignment', (hs.section_config ->> 'text_alignment'::text)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'hero_banner'::text) AND (hs.is_active = true))
UNION ALL
 SELECT 'tour_categories'::text AS section_type,
    2 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'categories', ( SELECT jsonb_agg(jsonb_build_object('id', tc.id, 'name', tc.name, 'slug', tc.slug, 'description', tc.description, 'icon', tc.icon, 'tour_count', tc.active_tour_count, 'avg_rating', tc.avg_rating, 'price_range', jsonb_build_object('min', tc.min_price, 'max', tc.max_price)) ORDER BY tc.display_order, tc.active_tour_count DESC) AS jsonb_agg
           FROM public.tour_categories tc
          WHERE (tc.is_active = true)
         LIMIT hs.max_items)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'tour_categories'::text) AND (hs.is_active = true))
UNION ALL
 SELECT 'bestseller_tours'::text AS section_type,
    3 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'tours', ( SELECT jsonb_agg(jsonb_build_object('id', t.id, 'title', t.name, 'slug', t.slug, 'short_description', t.short_description, 'price', t.original_price, 'original_price', t.original_price, 'discount_percentage', t.discount_percentage, 'rating', jsonb_build_object('average', t.rating, 'count', t.review_count), 'booking_count', t.booking_count, 'thumbnail', t.thumbnail_image, 'category', jsonb_build_object('id', tc.id, 'name', tc.name, 'slug', tc.slug), 'badges', array_remove(ARRAY[
                CASE
                    WHEN t.is_bestseller THEN 'bestseller'::text
                    ELSE NULL::text
                END,
                CASE
                    WHEN t.is_trending THEN 'trending'::text
                    ELSE NULL::text
                END,
                CASE
                    WHEN t.is_new THEN 'new'::text
                    ELSE NULL::text
                END], NULL::text)) ORDER BY t.booking_count DESC, t.rating DESC) AS jsonb_agg
           FROM (public.tours t
             LEFT JOIN public.tour_categories tc ON ((t.category_id = tc.id)))
          WHERE ((t.is_active = true) AND (t.is_bestseller = true))
         LIMIT hs.max_items)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'bestseller_tours'::text) AND (hs.is_active = true))
UNION ALL
 SELECT 'latest_tours'::text AS section_type,
    4 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'tours', ( SELECT jsonb_agg(jsonb_build_object('id', t.id, 'title', t.name, 'slug', t.slug, 'short_description', t.short_description, 'price', t.original_price, 'original_price', t.original_price, 'rating', jsonb_build_object('average', t.rating, 'count', t.review_count), 'thumbnail', t.thumbnail_image, 'category', jsonb_build_object('id', tc.id, 'name', tc.name, 'slug', tc.slug), 'destination', jsonb_build_object('id', d.id, 'name', d.name, 'slug', d.slug), 'created_at', t.created_at, 'badges', array_remove(ARRAY[
                CASE
                    WHEN t.is_new THEN 'new'::text
                    ELSE NULL::text
                END,
                CASE
                    WHEN t.is_featured THEN 'featured'::text
                    ELSE NULL::text
                END], NULL::text)) ORDER BY t.created_at DESC, t.rating DESC) AS jsonb_agg
           FROM ((public.tours t
             LEFT JOIN public.tour_categories tc ON ((t.category_id = tc.id)))
             LEFT JOIN public.destinations d ON ((d.id = ANY ((t.covered_destinations)::integer[]))))
          WHERE (t.is_active = true)
         LIMIT hs.max_items)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'latest_tours'::text) AND (hs.is_active = true))
UNION ALL
 SELECT 'customer_reviews'::text AS section_type,
    5 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'reviews', ( SELECT jsonb_agg(jsonb_build_object('id', fr.id, 'customer_name', fr.customer_name, 'customer_avatar', fr.customer_avatar, 'customer_location', fr.customer_location, 'rating', fr.rating, 'review_title', fr.title, 'review_text', fr.review_text, 'tour', jsonb_build_object('id', t.id, 'title', t.name, 'slug', t.slug), 'travel_date', fr.travel_date, 'verified', fr.is_verified, 'helpful_count', fr.helpful_votes, 'created_at', fr.created_at) ORDER BY fr.display_order, fr.helpful_votes DESC, fr.created_at DESC) AS jsonb_agg
           FROM (public.featured_reviews fr
             LEFT JOIN public.tours t ON ((fr.tour_id = t.id)))
          WHERE ((fr.is_homepage_highlight = true) AND ((fr.moderation_status)::text = 'approved'::text))
         LIMIT hs.max_items)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'customer_reviews'::text) AND (hs.is_active = true))
UNION ALL
 SELECT 'special_offers'::text AS section_type,
    6 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'offers', ( SELECT jsonb_agg(jsonb_build_object('id', so.id, 'title', so.title, 'slug', so.slug, 'description', so.description, 'discount', jsonb_build_object('type', so.offer_type, 'value',
                CASE
                    WHEN ((so.offer_type)::text = 'percentage'::text) THEN so.discount_percentage
                    ELSE so.discount_amount
                END), 'validity', jsonb_build_object('from', so.valid_from, 'until', so.valid_until), 'promo_code', so.promo_code, 'banner_image', so.banner_image, 'usage', jsonb_build_object('count', so.usage_count, 'limit', so.usage_limit)) ORDER BY so.display_order,
                CASE
                    WHEN ((so.offer_type)::text = 'percentage'::text) THEN so.discount_percentage
                    ELSE so.discount_amount
                END DESC) AS jsonb_agg
           FROM public.special_offers so
          WHERE ((so.is_active = true) AND (so.is_homepage_banner = true) AND (so.valid_until >= CURRENT_DATE))
         LIMIT hs.max_items)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'special_offers'::text) AND (hs.is_active = true))
UNION ALL
 SELECT 'featured_destinations'::text AS section_type,
    7 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'destinations', ( SELECT jsonb_agg(jsonb_build_object('id', d.id, 'name', d.name, 'slug', d.slug, 'short_description', d.short_description, 'featured_image', d.featured_image, 'tour_count', d.tour_count, 'avg_rating', d.avg_rating, 'price_range', jsonb_build_object('min', d.price_range_min, 'max', d.price_range_max, 'category', d.budget_category), 'location', jsonb_build_object('state', d.state, 'country', d.country), 'highlights', d.top_attractions, 'badges', array_remove(ARRAY[
                CASE
                    WHEN d.is_featured THEN 'featured'::text
                    ELSE NULL::text
                END,
                CASE
                    WHEN d.is_popular THEN 'popular'::text
                    ELSE NULL::text
                END,
                CASE
                    WHEN d.unesco_site THEN 'unesco'::text
                    ELSE NULL::text
                END], NULL::text)) ORDER BY d.display_order, d.tour_count DESC, d.avg_rating DESC) AS jsonb_agg
           FROM public.destinations d
          WHERE ((d.is_featured = true) AND (d.tour_count > 0))
         LIMIT hs.max_items)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'featured_destinations'::text) AND (hs.is_active = true))
UNION ALL
 SELECT 'blog_articles'::text AS section_type,
    8 AS section_order,
    jsonb_build_object('title', hs.title, 'subtitle', hs.subtitle, 'articles', ( SELECT jsonb_agg(jsonb_build_object('id', bp.id, 'title', bp.title, 'slug', bp.slug, 'excerpt', bp.excerpt, 'featured_image', bp.featured_image, 'category', bp.category, 'tags', bp.tags, 'reading_time', bp.reading_time, 'published_at', bp.published_at, 'view_count', bp.view_count, 'author_id', bp.author_id) ORDER BY bp.is_featured DESC, bp.published_at DESC, bp.view_count DESC) AS jsonb_agg
           FROM public.blog_posts bp
          WHERE (bp.is_published = true)
         LIMIT hs.max_items)) AS section_data,
    hs.is_active,
    hs.updated_at
   FROM public.homepage_settings hs
  WHERE (((hs.section_name)::text = 'blog_articles'::text) AND (hs.is_active = true));


ALTER VIEW public.v_homepage_data OWNER TO postgres;

--
-- Name: v_homepage_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_homepage_stats AS
 SELECT ( SELECT jsonb_build_object('total_tours', count(*), 'active_tours', count(*) FILTER (WHERE (tours.is_active = true)), 'featured_tours', count(*) FILTER (WHERE (tours.is_featured = true)), 'bestseller_tours', count(*) FILTER (WHERE (tours.is_bestseller = true)), 'trending_tours', count(*) FILTER (WHERE (tours.is_trending = true)), 'avg_rating', round(avg(tours.rating) FILTER (WHERE (tours.review_count > 0)), 2), 'total_bookings', sum(tours.booking_count), 'total_reviews', sum(tours.review_count)) AS jsonb_build_object
           FROM public.tours) AS tour_stats,
    ( SELECT jsonb_build_object('total_destinations', count(*), 'active_destinations', count(*) FILTER (WHERE (destinations.tour_count > 0)), 'featured_destinations', count(*) FILTER (WHERE (destinations.is_featured = true)), 'popular_destinations', count(*) FILTER (WHERE (destinations.is_popular = true)), 'avg_rating', round(avg(destinations.avg_rating) FILTER (WHERE (destinations.review_count > 0)), 2), 'total_bookings', sum(destinations.total_bookings)) AS jsonb_build_object
           FROM public.destinations) AS destination_stats,
    ( SELECT jsonb_build_object('total_categories', count(*), 'active_categories', count(*) FILTER (WHERE (tour_categories.is_active = true)), 'avg_tours_per_category', round(avg(tour_categories.active_tour_count), 1), 'avg_rating', round(avg(tour_categories.avg_rating) FILTER (WHERE (tour_categories.avg_rating > (0)::numeric)), 2), 'total_bookings', sum(tour_categories.total_bookings)) AS jsonb_build_object
           FROM public.tour_categories) AS category_stats,
    ( SELECT jsonb_build_object('total_reviews', count(*), 'featured_reviews', count(*) FILTER (WHERE (featured_reviews.is_homepage_highlight = true)), 'verified_reviews', count(*) FILTER (WHERE (featured_reviews.is_verified = true)), 'avg_rating', round(avg(featured_reviews.rating), 2), 'avg_helpful_votes', round(avg(featured_reviews.helpful_votes), 1)) AS jsonb_build_object
           FROM public.featured_reviews
          WHERE ((featured_reviews.moderation_status)::text = 'approved'::text)) AS review_stats,
    ( SELECT jsonb_build_object('total_offers', count(*), 'active_offers', count(*) FILTER (WHERE ((special_offers.is_active = true) AND (special_offers.valid_until >= CURRENT_DATE))), 'homepage_offers', count(*) FILTER (WHERE ((special_offers.is_homepage_banner = true) AND (special_offers.is_active = true))), 'avg_discount', round(avg(special_offers.discount_percentage) FILTER (WHERE ((special_offers.offer_type)::text = 'percentage'::text)), 1), 'total_usage', sum(special_offers.usage_count)) AS jsonb_build_object
           FROM public.special_offers) AS offer_stats,
    ( SELECT jsonb_build_object('total_articles', count(*), 'published_articles', count(*) FILTER (WHERE (blog_posts.is_published = true)), 'featured_articles', count(*) FILTER (WHERE (blog_posts.is_featured = true)), 'total_views', sum(blog_posts.view_count), 'avg_reading_time', round(avg(blog_posts.reading_time), 1)) AS jsonb_build_object
           FROM public.blog_posts) AS blog_stats,
    ( SELECT jsonb_build_object('last_updated', max(homepage_settings.updated_at), 'active_sections', count(*) FILTER (WHERE (homepage_settings.is_active = true)), 'total_sections', count(*)) AS jsonb_build_object
           FROM public.homepage_settings) AS homepage_performance;


ALTER VIEW public.v_homepage_stats OWNER TO postgres;

--
-- Name: v_search_data; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_search_data AS
 SELECT 'tour'::text AS result_type,
    t.id,
    t.name,
    t.slug,
    t.short_description AS description,
    t.thumbnail_image AS image,
    t.original_price,
    t.rating,
    t.review_count,
    jsonb_build_object('category', tc.name, 'destination', d.name, 'is_bestseller', t.is_bestseller, 'is_trending', t.is_trending) AS metadata,
    to_tsvector('english'::regconfig, (((((((t.name)::text || ' '::text) || (COALESCE(t.short_description, ''::character varying))::text) || ' '::text) || (COALESCE(tc.name, ''::character varying))::text) || ' '::text) || (COALESCE(d.name, ''::character varying))::text)) AS search_vector
   FROM ((public.tours t
     LEFT JOIN public.tour_categories tc ON ((t.category_id = tc.id)))
     LEFT JOIN public.destinations d ON ((d.id = ANY ((t.covered_destinations)::integer[]))))
  WHERE (t.is_active = true)
UNION ALL
 SELECT 'destination'::text AS result_type,
    d.id,
    d.name,
    d.slug,
    d.short_description AS description,
    d.featured_image AS image,
    d.price_range_min AS original_price,
    d.avg_rating AS rating,
    d.review_count,
    jsonb_build_object('state', d.state, 'country', d.country, 'tour_count', d.tour_count, 'is_featured', d.is_featured, 'is_popular', d.is_popular) AS metadata,
    to_tsvector('english'::regconfig, (((((d.name)::text || ' '::text) || COALESCE(d.description, ''::text)) || ' '::text) || (COALESCE(d.state, ''::character varying))::text)) AS search_vector
   FROM public.destinations d
  WHERE (d.tour_count > 0)
UNION ALL
 SELECT 'blog'::text AS result_type,
    bp.id,
    bp.title AS name,
    bp.slug,
    bp.excerpt AS description,
    bp.featured_image AS image,
    0 AS original_price,
    bp.avg_rating AS rating,
    bp.rating_count AS review_count,
    jsonb_build_object('category', bp.category, 'reading_time', bp.reading_time, 'published_at', bp.published_at, 'view_count', bp.view_count) AS metadata,
    to_tsvector('english'::regconfig, (((((bp.title)::text || ' '::text) || COALESCE(bp.content, ''::text)) || ' '::text) || (COALESCE(bp.category, ''::character varying))::text)) AS search_vector
   FROM public.blog_posts bp
  WHERE (bp.is_published = true);


ALTER VIEW public.v_search_data OWNER TO postgres;

--
-- Name: v_test_report; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_test_report AS
 SELECT test_category,
    count(*) AS total_tests,
    count(*) FILTER (WHERE ((status)::text = 'PASS'::text)) AS passed_tests,
    count(*) FILTER (WHERE ((status)::text = 'FAIL'::text)) AS failed_tests,
    count(*) FILTER (WHERE ((status)::text = 'WARNING'::text)) AS warning_tests,
    round((((count(*) FILTER (WHERE ((status)::text = 'PASS'::text)))::numeric / (count(*))::numeric) * (100)::numeric), 2) AS success_rate,
    avg(EXTRACT(epoch FROM execution_time)) AS avg_execution_time_seconds
   FROM public.test_results
  GROUP BY test_category
  ORDER BY test_category;


ALTER VIEW public.v_test_report OWNER TO postgres;

--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    capacity integer NOT NULL,
    price_per_day numeric(10,2) NOT NULL
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: addons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addons ALTER COLUMN id SET DEFAULT nextval('public.addons_id_seq'::regclass);


--
-- Name: analytics_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events ALTER COLUMN id SET DEFAULT nextval('public.analytics_events_id_seq'::regclass);


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: auditlogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditlogs ALTER COLUMN id SET DEFAULT nextval('public.auditlogs_id_seq'::regclass);


--
-- Name: blog_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories ALTER COLUMN id SET DEFAULT nextval('public.blog_categories_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: contact_inquiries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_inquiries ALTER COLUMN id SET DEFAULT nextval('public.contact_inquiries_id_seq'::regclass);


--
-- Name: dashboard_metrics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_metrics ALTER COLUMN id SET DEFAULT nextval('public.dashboard_metrics_id_seq'::regclass);


--
-- Name: destination_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_categories ALTER COLUMN id SET DEFAULT nextval('public.destination_categories_id_seq'::regclass);


--
-- Name: destination_likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_likes ALTER COLUMN id SET DEFAULT nextval('public.destination_likes_id_seq'::regclass);


--
-- Name: destination_seasons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_seasons ALTER COLUMN id SET DEFAULT nextval('public.destination_seasons_id_seq'::regclass);


--
-- Name: destinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations ALTER COLUMN id SET DEFAULT nextval('public.destinations_id_seq'::regclass);


--
-- Name: featured_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.featured_reviews ALTER COLUMN id SET DEFAULT nextval('public.featured_reviews_id_seq'::regclass);


--
-- Name: homepage_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homepage_settings ALTER COLUMN id SET DEFAULT nextval('public.homepage_settings_id_seq'::regclass);


--
-- Name: inclusions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inclusions ALTER COLUMN id SET DEFAULT nextval('public.inclusions_id_seq'::regclass);


--
-- Name: migration_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration_log ALTER COLUMN id SET DEFAULT nextval('public.migration_log_id_seq'::regclass);


--
-- Name: notification_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates ALTER COLUMN id SET DEFAULT nextval('public.notification_templates_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: packagetiers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packagetiers ALTER COLUMN id SET DEFAULT nextval('public.packagetiers_id_seq'::regclass);


--
-- Name: passwordresets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passwordresets ALTER COLUMN id SET DEFAULT nextval('public.passwordresets_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: review_helpfulness id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpfulness ALTER COLUMN id SET DEFAULT nextval('public.review_helpfulness_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: special_offers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_offers ALTER COLUMN id SET DEFAULT nextval('public.special_offers_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: test_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_results ALTER COLUMN id SET DEFAULT nextval('public.test_results_id_seq'::regclass);


--
-- Name: tour_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_categories ALTER COLUMN id SET DEFAULT nextval('public.tour_categories_id_seq'::regclass);


--
-- Name: tour_exclusions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_exclusions ALTER COLUMN id SET DEFAULT nextval('public.tour_exclusions_id_seq'::regclass);


--
-- Name: tour_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_images ALTER COLUMN id SET DEFAULT nextval('public.tour_images_id_seq'::regclass);


--
-- Name: tour_inclusions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_inclusions ALTER COLUMN id SET DEFAULT nextval('public.tour_inclusions_id_seq'::regclass);


--
-- Name: tour_statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_statistics ALTER COLUMN id SET DEFAULT nextval('public.tour_statistics_id_seq'::regclass);


--
-- Name: tours id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours ALTER COLUMN id SET DEFAULT nextval('public.tours_id_seq'::regclass);


--
-- Name: user_favorites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites ALTER COLUMN id SET DEFAULT nextval('public.user_favorites_id_seq'::regclass);


--
-- Name: user_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences ALTER COLUMN id SET DEFAULT nextval('public.user_preferences_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Data for Name: addons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addons (id, name, price, description) FROM stdin;
\.


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_events (id, event_type, user_id, session_id, page_url, referrer, user_agent, ip_address, country, city, device_type, browser, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (id, title, slug, content, excerpt, main_image_url, author_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, admin_user_id, action, target_entity, entity_id, details, ip_address, user_agent, "timestamp") FROM stdin;
\.


--
-- Data for Name: auditlogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditlogs (id, admin_user_id, action_type, target_entity, target_id, details, "timestamp") FROM stdin;
\.


--
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_categories (id, name, slug, description, created_at) FROM stdin;
\.


--
-- Data for Name: blog_post_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_post_categories (blog_post_id, category_id) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, title, slug, content, excerpt, featured_image_url, author_id, status, tags, meta_title, meta_description, read_time, view_count, is_featured, published_at, created_at, updated_at, featured_image, thumbnail_image, category, is_published, display_order, reading_time, word_count, language, like_count, share_count, comment_count, meta_keywords, canonical_url, og_image, scheduled_at, last_modified_by, related_tours, related_destinations, related_posts, table_of_contents, gallery_images, video_urls, avg_rating, rating_count, bounce_rate, avg_time_on_page, moderation_status, moderated_by, moderated_at, notify_subscribers, newsletter_sent, social_media_posted) FROM stdin;
36	Sustainable Tourism in South India: 10 Tips for Responsible Travel	sustainable-tourism-south-india	Responsible tourism in South India is no longer an option but a necessity. Discover how to travel while respecting the environment and local communities. 10 practical tips to adopt a sustainable approach to your South Indian adventures...	Practical guide to adopt responsible and sustainable tourism, with 10 concrete tips for traveling in South India while respecting the planet.	/images/blog/sustainable-south-india-featured.jpg	1	draft	{"sustainable tourism","responsible travel","south india","eco travel","community tourism"}	Sustainable Tourism South India: 10 Tips for Responsible Travel	Adopt responsible tourism in South India with our 10 practical tips for traveling while respecting the environment and local communities.	\N	1234	t	\N	2025-08-24 07:31:41.594133	2025-08-24 08:00:22.182809	\N	/images/blog/sustainable-south-india-thumb.jpg	Conseils	t	0	1	37	en	78	45	0	{"sustainable tourism south india","responsible travel","eco tourism","community based tourism","travel tips"}	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	0.00	0	0.00	0	approved	\N	\N	f	f	f
35	South Indian Street Food: A Culinary Journey Through Regional Flavors	south-indian-street-food-journey	Embark on a discovery of South Indian street food, a true culinary institution. From Chennai to Bangalore, through Kochi and Hyderabad, explore the authentic flavors and local specialties that make South Indian street cuisine so rich...	Culinary journey through South India to discover the best street food specialties and their secrets.	/images/blog/south-indian-street-food-featured.jpg	1	draft	{"south indian food","street food","regional cuisine","culinary travel","food culture"}	South Indian Street Food: Guide to Regional Specialties	Discover authentic South Indian street food with our guide to the best regional specialties from Chennai, Bangalore, Kochi and Hyderabad.	\N	1876	t	\N	2025-08-24 07:31:41.594133	2025-08-24 08:00:22.182809	\N	/images/blog/south-indian-street-food-thumb.jpg	Gastronomie	t	0	1	36	en	92	28	0	{"south indian street food","regional cuisine","food travel","culinary journey","local specialties"}	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	0.00	0	0.00	0	approved	\N	\N	f	f	f
34	How to Plan Your First Trip to Kerala Backwaters	first-trip-kerala-backwaters	Kerala's backwaters fascinate and enchant visitors from around the world. This complete guide accompanies you in planning your first journey to God's Own Country. Houseboat bookings, best routes, cultural experiences... all our tips for a successful stay...	Complete guide for planning your first Kerala backwaters experience: houseboats, routes, culture, and practical tips.	/images/blog/kerala-backwaters-guide-featured.jpg	1	draft	{kerala,backwaters,"first time",houseboat,"travel guide"}	First Trip to Kerala Backwaters: Complete Guide 2024	Everything you need to know for your first Kerala backwaters trip. Practical guide with expert advice and essential tips.	\N	3421	t	\N	2025-08-24 07:31:41.594133	2025-08-24 08:00:22.182809	\N	/images/blog/kerala-backwaters-guide-thumb.jpg	Guides	t	0	1	37	en	156	67	0	{"kerala backwaters","kerala guide","first trip kerala","houseboat experience","travel tips"}	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	0.00	0	0.00	0	approved	\N	\N	f	f	f
33	Top 10 Hidden Gems of South India in 2024	hidden-gems-south-india-2024	Discover the lesser-known treasures of South India that will captivate travelers in 2024. From secret beaches in Karnataka to ancient temples in Tamil Nadu, these hidden gems offer unique and unforgettable experiences away from the crowds...	Our exclusive selection of South India's hidden gems for 2024, with expert tips for planning your authentic regional journey.	/images/blog/south-india-gems-featured.jpg	1	draft	{"south india","hidden gems",2024,"offbeat travel","regional tourism"}	Hidden Gems of South India 2024 | Complete Travel Guide	Discover the top 10 hidden gems of South India for 2024 with our expert guide. Photos, tips and recommendations for your authentic journey.	\N	2456	t	\N	2025-08-24 07:31:41.594133	2025-08-24 08:00:22.182809	\N	/images/blog/south-india-gems-thumb.jpg	Destinations	t	0	1	36	en	89	34	0	{"south india hidden gems","offbeat south india","regional travel","authentic experiences","travel guide"}	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	0.00	0	0.00	0	approved	\N	\N	f	f	f
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, user_id, tour_id, package_tier_id, travel_date, number_of_persons, additional_vehicles, selected_addons, status, payment_timestamp, total_price, selected_currency, inquiry_date, customer_notes, admin_notes, cancellation_reason, cancelled_at, confirmed_at) FROM stdin;
1	1	1	1	2025-08-28	2	\N	\N	confirmed	\N	35000.00	INR	2025-08-17 15:26:13.662216+01	\N	\N	\N	\N	\N
2	2	1	2	2025-09-02	2	\N	\N	confirmed	\N	45000.00	INR	2025-08-16 15:26:13.662216+01	\N	\N	\N	\N	\N
3	3	1	3	2025-09-07	2	\N	\N	confirmed	\N	55000.00	INR	2025-08-15 15:26:13.662216+01	\N	\N	\N	\N	\N
4	4	1	1	2025-09-12	2	\N	\N	confirmed	\N	35000.00	INR	2025-08-14 15:26:13.662216+01	\N	\N	\N	\N	\N
5	5	1	2	2025-09-17	2	\N	\N	confirmed	\N	45000.00	INR	2025-08-13 15:26:13.662216+01	\N	\N	\N	\N	\N
6	6	1	3	2025-09-22	2	\N	\N	confirmed	\N	55000.00	INR	2025-08-12 15:26:13.662216+01	\N	\N	\N	\N	\N
7	7	1	1	2025-09-27	2	\N	\N	confirmed	\N	35000.00	INR	2025-08-11 15:26:13.662216+01	\N	\N	\N	\N	\N
8	8	1	2	2025-10-02	2	\N	\N	confirmed	\N	45000.00	INR	2025-08-10 15:26:13.662216+01	\N	\N	\N	\N	\N
9	9	2	1	2025-08-28	2	\N	\N	confirmed	\N	40000.00	INR	2025-08-17 15:26:13.662216+01	\N	\N	\N	\N	\N
10	10	2	2	2025-09-02	2	\N	\N	confirmed	\N	50000.00	INR	2025-08-16 15:26:13.662216+01	\N	\N	\N	\N	\N
11	11	2	3	2025-09-07	2	\N	\N	confirmed	\N	60000.00	INR	2025-08-15 15:26:13.662216+01	\N	\N	\N	\N	\N
12	12	2	1	2025-09-12	2	\N	\N	confirmed	\N	40000.00	INR	2025-08-14 15:26:13.662216+01	\N	\N	\N	\N	\N
13	13	2	2	2025-09-17	2	\N	\N	confirmed	\N	50000.00	INR	2025-08-13 15:26:13.662216+01	\N	\N	\N	\N	\N
14	14	2	3	2025-09-22	2	\N	\N	confirmed	\N	60000.00	INR	2025-08-12 15:26:13.662216+01	\N	\N	\N	\N	\N
15	15	2	1	2025-09-27	2	\N	\N	confirmed	\N	40000.00	INR	2025-08-11 15:26:13.662216+01	\N	\N	\N	\N	\N
16	1	2	2	2025-10-02	2	\N	\N	confirmed	\N	50000.00	INR	2025-08-10 15:26:13.662216+01	\N	\N	\N	\N	\N
17	2	3	1	2025-08-28	2	\N	\N	confirmed	\N	45000.00	INR	2025-08-17 15:26:13.662216+01	\N	\N	\N	\N	\N
18	3	3	2	2025-09-02	2	\N	\N	confirmed	\N	55000.00	INR	2025-08-16 15:26:13.662216+01	\N	\N	\N	\N	\N
19	4	3	3	2025-09-07	2	\N	\N	confirmed	\N	65000.00	INR	2025-08-15 15:26:13.662216+01	\N	\N	\N	\N	\N
20	5	3	1	2025-09-12	2	\N	\N	confirmed	\N	45000.00	INR	2025-08-14 15:26:13.662216+01	\N	\N	\N	\N	\N
21	6	3	2	2025-09-17	2	\N	\N	confirmed	\N	55000.00	INR	2025-08-13 15:26:13.662216+01	\N	\N	\N	\N	\N
22	7	3	3	2025-09-22	2	\N	\N	confirmed	\N	65000.00	INR	2025-08-12 15:26:13.662216+01	\N	\N	\N	\N	\N
23	8	3	1	2025-09-27	2	\N	\N	confirmed	\N	45000.00	INR	2025-08-11 15:26:13.662216+01	\N	\N	\N	\N	\N
24	9	3	2	2025-10-02	2	\N	\N	confirmed	\N	55000.00	INR	2025-08-10 15:26:13.662216+01	\N	\N	\N	\N	\N
25	10	5	1	2025-08-30	2	\N	\N	confirmed	\N	67000.00	INR	2025-08-20 15:26:13.662216+01	\N	\N	\N	\N	\N
26	11	5	2	2025-09-06	2	\N	\N	confirmed	\N	79000.00	INR	2025-08-19 15:26:13.662216+01	\N	\N	\N	\N	\N
27	12	5	3	2025-09-13	2	\N	\N	confirmed	\N	91000.00	INR	2025-08-18 15:26:13.662216+01	\N	\N	\N	\N	\N
28	13	6	1	2025-08-30	2	\N	\N	confirmed	\N	73000.00	INR	2025-08-20 15:26:13.662216+01	\N	\N	\N	\N	\N
29	14	6	2	2025-09-06	2	\N	\N	confirmed	\N	85000.00	INR	2025-08-19 15:26:13.662216+01	\N	\N	\N	\N	\N
30	15	6	3	2025-09-13	2	\N	\N	confirmed	\N	97000.00	INR	2025-08-18 15:26:13.662216+01	\N	\N	\N	\N	\N
\.


--
-- Data for Name: contact_inquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_inquiries (id, name, email, phone, subject, message, inquiry_type, status, priority, assigned_to, response_sent, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dashboard_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_metrics (id, metric_name, metric_value, metric_date, period_type, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: destination_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_categories (id, name, slug, description, icon, color, display_order, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: destination_category_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_category_assignments (destination_id, category_id, created_at) FROM stdin;
\.


--
-- Data for Name: destination_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_likes (id, user_id, destination_id, created_at) FROM stdin;
\.


--
-- Data for Name: destination_seasons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destination_seasons (id, destination_id, season, is_ideal, description, created_at) FROM stdin;
\.


--
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.destinations (id, name, country, description, main_image_url, created_at, updated_at, is_active, slug, short_description, featured_image, thumbnail_image, gallery_images, video_url, latitude, longitude, state, region, timezone, is_featured, is_popular, is_trending, display_order, best_time_to_visit, climate_info, local_language, currency, time_zone_offset, top_attractions, activities, specialties, cultural_highlights, how_to_reach, nearest_airport, nearest_railway, local_transport, accommodation_types, tour_count, total_bookings, avg_rating, review_count, view_count, wishlist_count, price_range_min, price_range_max, budget_category, meta_title, meta_description, meta_keywords, canonical_url, og_image, peak_season, off_season, festivals_events, weather_data, recommended_duration, difficulty_level, family_friendly, adventure_level, eco_friendly, unesco_site, heritage_site, wildlife_sanctuary, related_destinations, nearby_destinations, parent_destination_id, travel_tips, local_customs, safety_info, packing_suggestions, conversion_rate, bounce_rate, avg_session_duration) FROM stdin;
134	Lakshadweep	India	Discover pristine coral islands, crystal-clear lagoons, water sports, and untouched natural beauty.	\N	2025-08-24 07:31:41.594133+01	2025-08-24 08:00:27.067268+01	t	lakshadweep	Discover pristine coral islands, crystal-clear lagoons, water sports, and untouched natural beauty....	/images/destinations/lakshadweep-featured.jpg	/images/destinations/lakshadweep-thumb.jpg	\N	\N	10.56670000	72.64170000	\N	\N	Asia/Kolkata	t	t	f	8	October to May	Tropical	Malayalam, English	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	0	0	0.00	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
5	Thekkady	India	Wildlife sanctuary with spice plantations	https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800	2025-08-23 15:26:13.662216+01	2025-08-24 08:00:27.067268+01	t	thekkady	Wildlife sanctuary with spice plantations...	\N	\N	\N	\N	9.59160000	77.16030000	South India	\N	Asia/Kolkata	t	t	f	0	\N	\N	\N	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	1	0	4.50	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	2-3 days	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
1	Kanyakumari	India	Southernmost tip of India where three seas meet	https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800	2025-08-23 15:26:13.662216+01	2025-08-24 08:00:27.067268+01	t	kanyakumari	Southernmost tip of India where three seas meet...	\N	\N	\N	\N	\N	\N	South India	\N	Asia/Kolkata	t	t	f	0	\N	\N	\N	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	1	0	4.25	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	2-3 days	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
127	Kerala	India	God's Own Country offers enchanting backwaters, lush hill stations, pristine beaches, and rich cultural heritage.	\N	2025-08-24 07:31:41.594133+01	2025-08-24 08:00:27.067268+01	t	kerala	God's Own Country offers enchanting backwaters, lush hill stations, pristine beaches, and rich cultural heritage....	/images/destinations/kerala-featured.jpg	/images/destinations/kerala-thumb.jpg	\N	\N	10.85050000	76.27110000	\N	\N	Asia/Kolkata	t	t	f	1	October to March	Tropical monsoon	Malayalam, English	INR	+05:30	{Backwaters,"Spice Plantations",Beaches,"Hill Stations",Temples}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	0	0	0.00	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
130	Andhra Pradesh	India	Explore ancient Buddhist sites, spicy cuisine, beautiful beaches, and the modern city of Hyderabad.	\N	2025-08-24 07:31:41.594133+01	2025-08-24 08:00:27.067268+01	t	andhra-pradesh	Explore ancient Buddhist sites, spicy cuisine, beautiful beaches, and the modern city of Hyderabad....	/images/destinations/andhrapradesh-featured.jpg	/images/destinations/andhrapradesh-thumb.jpg	\N	\N	15.91290000	79.74000000	\N	\N	Asia/Kolkata	t	t	f	4	October to March	Tropical	Telugu, English	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	0	0	0.00	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
2	Cochin	India	Kerala's vibrant port city with stunning backwaters	https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800	2025-08-23 15:26:13.662216+01	2025-08-24 08:00:27.067268+01	t	cochin	Kerala's vibrant port city with stunning backwaters...	\N	\N	\N	\N	\N	\N	South India	\N	Asia/Kolkata	t	t	f	0	\N	\N	\N	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	1	0	4.25	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	2-3 days	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
129	Tamil Nadu	India	Experience magnificent Dravidian temples, classical dance, hill stations, and rich Tamil culture.	\N	2025-08-24 07:31:41.594133+01	2025-08-24 08:00:27.067268+01	t	tamil-nadu	Experience magnificent Dravidian temples, classical dance, hill stations, and rich Tamil culture....	/images/destinations/tamilnadu-featured.jpg	/images/destinations/tamilnadu-thumb.jpg	\N	\N	11.12710000	78.65690000	\N	\N	Asia/Kolkata	t	t	f	3	November to March	Tropical wet and dry	Tamil, English	INR	+05:30	{Temples,"Hill Stations",Beaches,"Cultural Sites","Heritage Buildings"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	0	0	0.00	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
128	Karnataka	India	Discover ancient temples, royal palaces, coffee plantations, and the vibrant city of Bangalore.	\N	2025-08-24 07:31:41.594133+01	2025-08-24 08:00:27.067268+01	t	karnataka	Discover ancient temples, royal palaces, coffee plantations, and the vibrant city of Bangalore....	/images/destinations/karnataka-featured.jpg	/images/destinations/karnataka-thumb.jpg	\N	\N	15.31730000	75.71390000	\N	\N	Asia/Kolkata	t	t	f	2	October to February	Tropical savanna	Kannada, English	INR	+05:30	{Palaces,Gardens,Temples,"Coffee Plantations","Wildlife Sanctuaries"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	0	0	0.00	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
131	Telangana	India	Discover the Pearl City Hyderabad, ancient forts, Nizami culture, and delicious biryani.	\N	2025-08-24 07:31:41.594133+01	2025-08-24 08:00:27.067268+01	t	telangana	Discover the Pearl City Hyderabad, ancient forts, Nizami culture, and delicious biryani....	/images/destinations/telangana-featured.jpg	/images/destinations/telangana-thumb.jpg	\N	\N	18.11240000	79.01930000	\N	\N	Asia/Kolkata	t	t	f	5	October to February	Semi-arid	Telugu, English	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	0	0	0.00	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
3	Munnar	India	Hill station famous for tea plantations and cool climate	https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800	2025-08-23 15:26:13.662216+01	2025-08-24 08:00:27.067268+01	t	munnar	Hill station famous for tea plantations and cool climate...	\N	\N	\N	\N	10.08890000	77.05950000	Kerala	\N	Asia/Kolkata	t	t	f	0	\N	\N	\N	INR	+05:30	{"Tea Gardens","Eravikulam National Park","Mattupetty Dam","Echo Point","Top Station"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	1	0	4.75	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	2-3 days	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
4	Alleppey	India	Venice of the East with serene backwater cruises	https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800	2025-08-23 15:26:13.662216+01	2025-08-24 08:00:27.067268+01	t	alleppey	Venice of the East with serene backwater cruises...	\N	\N	\N	\N	9.49810000	76.33880000	Kerala	\N	Asia/Kolkata	t	t	f	0	\N	\N	\N	INR	+05:30	{"Backwater Cruises","Houseboat Stays","Vembanad Lake",Beaches,"Coir Industry"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	1	0	4.75	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	2-3 days	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
133	Pondicherry	India	Experience French colonial charm, spiritual ashrams, beautiful beaches, and unique Indo-French culture.	\N	2025-08-24 07:31:41.594133+01	2025-08-24 08:00:27.067268+01	t	pondicherry	Experience French colonial charm, spiritual ashrams, beautiful beaches, and unique Indo-French culture....	/images/destinations/pondicherry-featured.jpg	/images/destinations/pondicherry-thumb.jpg	\N	\N	11.94160000	79.80830000	\N	\N	Asia/Kolkata	t	t	f	7	October to March	Tropical wet and dry	Tamil, French, English	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	0	0	0.00	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	\N	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
6	Goa	India	Beach paradise with Portuguese heritage	https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800	2025-08-23 15:26:13.662216+01	2025-08-24 08:00:27.067268+01	t	goa	Beach paradise with Portuguese heritage...	\N	\N	\N	\N	\N	\N	Goa	\N	Asia/Kolkata	t	t	f	0	\N	\N	\N	INR	+05:30	{"Cultural Sites","Natural Beauty","Local Cuisine","Traditional Arts","Spiritual Places"}	{Sightseeing,"Cultural Tours","Local Cuisine Tasting",Shopping,Photography}	\N	\N	\N	\N	\N	\N	\N	1	0	4.25	0	0	0	0.00	0.00	moderate	\N	\N	\N	\N	\N	\N	\N	[]	{}	2-3 days	easy	t	low	f	f	f	f	\N	\N	\N	\N	\N	\N	\N	0.00	0.00	0
\.


--
-- Data for Name: featured_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.featured_reviews (id, original_review_id, customer_name, customer_email, customer_location, customer_avatar, rating, title, review_text, tour_name, tour_id, travel_date, review_source, review_language, is_featured, is_homepage_highlight, is_verified, display_order, helpful_votes, total_votes, view_count, moderation_status, moderated_by, moderated_at, moderation_notes, team_response, team_response_by, team_response_at, sentiment_score, keywords, group_size, travel_type, review_date, created_at, updated_at) FROM stdin;
1	\N	Sarah Johnson	\N	London, UK	\N	5	Absolutely Amazing Cultural Experience!	Our 10-day cultural tour of South India was beyond our expectations. The temples in Tamil Nadu were breathtaking, and our guide was incredibly knowledgeable about the history and traditions. The local cuisine experiences were a highlight - we learned to cook traditional dishes in a local family home. The accommodation was comfortable and the transportation was seamless. I would highly recommend this tour to anyone interested in experiencing authentic Indian culture.	South India Cultural Heritage Tour	\N	2024-12-15	website	en	t	t	t	1	0	0	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	2	couple	2025-08-24 08:00:20.505104	2025-08-24 08:00:20.505104	2025-08-24 08:00:27.067268
2	\N	Michael Chen	\N	Singapore	\N	5	Perfect Adventure in Kerala Backwaters	The backwater cruise in Kerala was the perfect blend of relaxation and adventure. Our houseboat was beautifully appointed with all modern amenities while maintaining traditional charm. The crew was friendly and the food was exceptional. Watching the sunset over the backwaters while enjoying fresh seafood was magical. The wildlife spotting and village visits added great cultural depth to the experience.	Kerala Backwaters Houseboat Experience	\N	2024-11-28	website	en	t	t	t	2	0	0	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	4	family	2025-08-24 08:00:20.505104	2025-08-24 08:00:20.505104	2025-08-24 08:00:27.067268
3	\N	Emma Rodriguez	\N	Barcelona, Spain	\N	4	Great Wildlife Safari Experience	Our wildlife tour to Periyar National Park was fantastic. We saw elephants, various bird species, and even spotted a tiger! The eco-lodge accommodation was comfortable and the guides were very professional. The only minor issue was that some activities were weather-dependent, but the team handled it well with alternative arrangements. Overall, a memorable experience for nature lovers.	Periyar Wildlife Safari	\N	2024-10-20	website	en	t	f	t	3	0	0	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	3	friends	2025-08-24 08:00:20.505104	2025-08-24 08:00:20.505104	2025-08-24 08:00:27.067268
4	\N	David Thompson	\N	Melbourne, Australia	\N	5	Incredible Hill Station Retreat	Munnar exceeded all our expectations! The tea plantation tours were educational and scenic, the weather was perfect, and our resort had stunning mountain views. The trekking experiences were well-organized with experienced guides. The local spice garden visit was fascinating. This tour is perfect for those seeking a peaceful retreat in nature with plenty of activities.	Munnar Hill Station Adventure	\N	2024-09-10	website	en	t	f	t	4	0	0	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	2	couple	2025-08-24 08:00:20.505104	2025-08-24 08:00:20.505104	2025-08-24 08:00:27.067268
5	\N	Priya Patel	\N	Mumbai, India	\N	5	Spiritual Journey Beyond Words	The spiritual tour covering Madurai, Rameswaram, and Kanyakumari was deeply moving. Each temple had its own unique energy and our guide explained the significance beautifully. The sunrise at Kanyakumari was breathtaking. The accommodation near temples was convenient and the vegetarian meals were delicious. This tour is perfect for those seeking spiritual enrichment and cultural understanding.	South India Spiritual Circuit	\N	2024-08-25	website	en	t	t	t	5	0	0	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	6	family	2025-08-24 08:00:20.505104	2025-08-24 08:00:20.505104	2025-08-24 08:00:27.067268
6	\N	Sarah Johnson	sarah.johnson@email.com	London, UK	\N	5	Absolutely magical Kerala experience!	Kerala backwaters exceeded all our expectations! The houseboat cruise was serene and peaceful, and the spice plantation tour was fascinating. Our guide was knowledgeable about local culture and wildlife. The Kathakali performance was mesmerizing. Highly recommend this authentic South Indian experience!	\N	77	2024-03-15	website	en	t	f	t	0	23	25	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
7	\N	Michael Thompson	michael.thompson@email.com	Melbourne, Australia	\N	5	Incredible heritage tour of Karnataka	Karnataka's rich history came alive during this tour! Mysore Palace illumination was breathtaking, and Hampi ruins transported us back to the Vijayanagara Empire. Our heritage guide was exceptional, sharing fascinating stories about Tipu Sultan and ancient dynasties. A must-do for history enthusiasts!	\N	78	2024-02-28	website	en	t	f	t	0	31	35	0	approved	\N	\N	\N	\N	\N	\N	0.00	\N	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
8	\N	Emma Wilson	emma.wilson@email.com	Toronto, Canada	\N	4	Spiritual journey through Tamil Nadu temples	Tamil Nadu's Dravidian temples are architectural marvels! Meenakshi Temple in Madurai was awe-inspiring, and the Bharatanatyam performance was beautiful. The temple guides were very informative about Hindu traditions. Only minor issue was the crowds during festival season, but that added to the authentic experience.	\N	79	2024-01-20	website	en	t	f	t	0	18	20	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
9	\N	David Chen	david.chen@email.com	Singapore	\N	5	Hyderabad - A culinary and cultural delight!	Three days of pure indulgence in Hyderabad! The Nizami heritage tour was fascinating, and Charminar at sunset was spectacular. But the highlight was definitely the biryani cooking class - now I can make authentic Hyderabadi biryani at home! The food tour guide knew all the best local spots.	\N	80	2024-03-01	website	en	t	f	t	0	27	30	0	approved	\N	\N	\N	\N	\N	\N	-0.33	\N	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
10	\N	Lisa Rodriguez	lisa.rodriguez@email.com	Madrid, Spain	\N	5	Perfect blend of relaxation and culture	Goa offered the perfect balance of beach relaxation and cultural exploration! The Portuguese colonial architecture in Old Goa was fascinating, and Basilica of Bom Jesus was stunning. The spice plantation tour was educational, and the sunset cruise on Mandovi River was romantic. Loved the laid-back Goan lifestyle!	\N	81	2024-02-10	website	en	t	f	t	0	34	40	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
11	\N	James Mitchell	james.mitchell@email.com	Dublin, Ireland	\N	4	Kerala backwaters - truly God's Own Country	Amazing experience in Kerala! The houseboat was comfortable and the backwater scenery was breathtaking. The spice garden tour was educational and the Ayurvedic massage was very relaxing. The only minor issue was some mosquitoes in the evening, but that's expected in such natural settings.	\N	77	2024-03-20	website	en	t	f	t	0	12	15	0	approved	\N	\N	\N	\N	\N	\N	1.00	\N	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
\.


--
-- Data for Name: gallery_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery_images (id, title, description, location, category, date, filename, path, views, thumbnail_path, tags, is_featured, color_palette, aspect_ratio, blur_hash, file_size, dimensions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: homepage_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.homepage_settings (id, section_name, section_type, is_active, display_order, title, subtitle, description, background_image, background_color, text_color, accent_color, section_config, max_items, items_per_row, mobile_items_per_row, animation_type, animation_duration, animation_delay, hide_on_mobile, hide_on_tablet, hide_on_desktop, meta_title, meta_description, cache_duration, last_cache_refresh, ab_test_variant, ab_test_active, view_count, click_count, conversion_count, created_at, updated_at) FROM stdin;
1	hero_banner	hero	t	1	Discover South India's Hidden Gems	Authentic Cultural Experiences & Adventures	Embark on unforgettable journeys through the rich heritage, stunning landscapes, and vibrant culture of South India with our expertly crafted tour packages.	\N	\N	\N	\N	{"slides": [{"image": "/images/hero/kerala-backwaters.jpg", "title": "Kerala Backwaters", "cta_link": "/tours/kerala-backwaters", "cta_text": "Explore Now", "subtitle": "Serene Houseboat Experiences"}, {"image": "/images/hero/tamil-nadu-temples.jpg", "title": "Tamil Nadu Temples", "cta_link": "/tours/tamil-nadu-temples", "cta_text": "Discover More", "subtitle": "Ancient Architecture & Spirituality"}], "autoplay": true, "autoplay_speed": 5000, "show_search_bar": true}	3	1	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
2	tour_categories	categories	t	2	Explore by Categories	Find Your Perfect Adventure	Choose from our diverse range of tour categories, each offering unique experiences tailored to different interests and preferences.	\N	\N	\N	\N	{"layout": "grid", "hover_effect": "zoom", "show_tour_count": true, "show_price_range": true}	8	4	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
3	bestseller_tours	bestsellers	t	3	Bestseller Tours	Most Popular Experiences	Discover our most loved tour packages, chosen by thousands of satisfied travelers for their exceptional value and unforgettable experiences.	\N	\N	\N	\N	{"sort_by": "total_bookings", "show_price": true, "show_rating": true, "show_discount": true, "show_duration": true}	6	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
4	latest_tours	latest_tours	t	4	Latest Tours	Newly Added Experiences	Explore our newest tour packages featuring fresh destinations and innovative experiences crafted by our travel experts.	\N	\N	\N	\N	{"sort_by": "created_date", "show_new_badge": true, "show_early_bird_discount": true}	4	2	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
5	customer_reviews	reviews	t	5	What Our Travelers Say	Real Stories, Real Experiences	Read authentic reviews from our satisfied customers who have experienced the magic of South India through our carefully curated tours.	\N	\N	\N	\N	{"layout": "carousel", "autoplay": true, "autoplay_speed": 4000, "show_tour_name": true, "show_rating_stars": true, "show_customer_photo": true}	5	1	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
6	special_offers	offers	t	6	Special Offers	Limited Time Deals	Don't miss out on our exclusive offers and seasonal discounts. Book now and save on your dream South India adventure.	\N	\N	\N	\N	{"layout": "banner", "show_countdown": true, "highlight_featured": true, "show_discount_percentage": true}	3	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
7	destination_videos	videos	t	7	Experience South India	Watch Our Destination Videos	Get a glimpse of the incredible experiences waiting for you in South India through our curated collection of destination videos.	\N	\N	\N	\N	{"show_duration": true, "video_platform": "youtube", "show_thumbnails": true, "autoplay_on_hover": false}	4	2	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
8	why_choose_us	why_choose_us	t	8	Why Choose EbookingSAM?	Your Trusted Travel Partner	With years of experience and thousands of satisfied customers, we are committed to providing exceptional travel experiences in South India.	\N	\N	\N	\N	{"features": [{"icon": "fa-award", "title": "Expert Local Guides", "description": "Knowledgeable guides with deep local insights"}, {"icon": "fa-shield-alt", "title": "Safe & Secure", "description": "Your safety is our top priority"}, {"icon": "fa-heart", "title": "Personalized Service", "description": "Tailored experiences for every traveler"}, {"icon": "fa-clock", "title": "24/7 Support", "description": "Round-the-clock assistance during your trip"}]}	4	2	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
9	travel_guide	travel_guide	t	9	South India Travel Guide	Essential Information for Your Journey	Everything you need to know about traveling in South India, from the best time to visit to local customs and practical tips.	\N	\N	\N	\N	{"layout": "accordion", "show_weather_info": true, "show_cultural_tips": true, "show_best_time_to_visit": true}	6	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
10	featured_destinations	destinations	t	10	Featured Destinations	Must-Visit Places in South India	Explore the most captivating destinations in South India, each offering unique cultural experiences and natural beauty.	\N	\N	\N	\N	{"layout": "masonry", "show_best_time": true, "show_highlights": true, "show_tour_count": true}	6	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:20.97539	2025-08-24 08:00:20.97539
12	featured_tours	tours	t	2	Featured South India Tours	Our most popular South Indian experiences	\N	\N	\N	\N	\N	{"layout": "grid", "max_items": 6, "show_prices": true, "show_ratings": true}	6	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
13	destinations	destinations	t	3	Featured South India Destinations	Explore our most popular South Indian destinations	\N	\N	\N	\N	\N	{"layout": "carousel", "max_items": 8, "show_tour_count": true}	6	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
14	testimonials	testimonials	t	4	What Our South India Travelers Say	Authentic reviews from our clients	\N	\N	\N	\N	\N	{"max_items": 4, "auto_rotate": true, "show_photos": true, "rotation_speed": 5000}	6	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
15	blog_posts	blog	t	5	South India Travel Inspiration	Tips and guides from our South India experts	\N	\N	\N	\N	\N	{"max_items": 3, "show_excerpt": true, "show_reading_time": true}	6	3	1	fade-in	500	0	f	f	f	\N	\N	3600	\N	\N	f	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
\.


--
-- Data for Name: inclusions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inclusions (id, package_tier_id, description, is_included) FROM stdin;
\.


--
-- Data for Name: migration_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migration_log (id, script_name, execution_time, status, error_message, execution_duration_seconds, affected_rows) FROM stdin;
1	001_backup_preparation.sql	2025-08-24 03:27:04.919997	completed	\N	\N	0
2	002_create_tour_categories.sql	2025-08-24 03:27:04.970515	started	\N	\N	0
3	002_create_tour_categories.sql	2025-08-24 03:27:04.970515	completed	\N	\N	8
4	003_create_special_offers.sql	2025-08-24 03:27:05.218859	started	\N	\N	0
5	003_create_special_offers.sql	2025-08-24 03:27:05.218859	completed	\N	\N	3
1205	016_remove_duration_difficulty_fields.sql	2025-08-24 06:02:38.450352	started	\N	\N	0
7	001_backup_preparation.sql	2025-08-24 03:28:28.230265	completed	\N	\N	0
1206	016_remove_duration_difficulty_fields.sql	2025-08-24 06:02:38.450352	completed	\N	\N	0
1259	001_backup_preparation.sql	2025-08-24 06:15:55.26867	completed	\N	\N	0
10	008_enrich_blog_posts_table.sql	2025-08-24 03:29:17.103362	started	\N	\N	0
11	008_enrich_blog_posts_table.sql	2025-08-24 03:29:17.103362	completed	\N	\N	0
12	009_enrich_destinations_table.sql	2025-08-24 03:29:17.347175	started	\N	\N	0
13	009_enrich_destinations_table.sql	2025-08-24 03:29:17.347175	completed	\N	\N	6
1260	002_create_tour_categories.sql	2025-08-24 06:15:55.333002	started	\N	\N	0
1261	002_create_tour_categories.sql	2025-08-24 06:15:55.333002	completed	\N	\N	8
1262	003_create_special_offers.sql	2025-08-24 06:15:55.569199	started	\N	\N	0
17	013_create_utility_functions.sql	2025-08-24 03:29:18.381965	started	\N	\N	0
18	013_create_utility_functions.sql	2025-08-24 03:29:18.381965	completed	\N	\N	0
1263	003_create_special_offers.sql	2025-08-24 06:15:55.569199	completed	\N	\N	2
1264	004_create_tour_statistics.sql	2025-08-24 06:15:55.861715	started	\N	\N	0
21	001_backup_preparation.sql	2025-08-24 03:33:41.931672	completed	\N	\N	0
22	002_create_tour_categories.sql	2025-08-24 03:33:41.982347	started	\N	\N	0
23	002_create_tour_categories.sql	2025-08-24 03:33:41.982347	completed	\N	\N	8
24	003_create_special_offers.sql	2025-08-24 03:33:42.231498	started	\N	\N	0
25	003_create_special_offers.sql	2025-08-24 03:33:42.231498	completed	\N	\N	3
1265	004_create_tour_statistics.sql	2025-08-24 06:15:55.861715	completed	\N	\N	0
27	001_backup_preparation.sql	2025-08-24 03:34:01.122556	completed	\N	\N	0
28	002_create_tour_categories.sql	2025-08-24 03:34:01.184525	started	\N	\N	0
29	002_create_tour_categories.sql	2025-08-24 03:34:01.184525	completed	\N	\N	8
30	003_create_special_offers.sql	2025-08-24 03:34:01.574183	started	\N	\N	0
31	003_create_special_offers.sql	2025-08-24 03:34:01.574183	completed	\N	\N	3
32	004_create_tour_statistics.sql	2025-08-24 03:34:02.025752	started	\N	\N	0
33	004_create_tour_statistics.sql	2025-08-24 03:34:02.025752	completed	\N	\N	0
34	005_create_featured_reviews.sql	2025-08-24 03:34:02.586263	started	\N	\N	0
35	005_create_featured_reviews.sql	2025-08-24 03:34:02.586263	completed	\N	\N	5
36	006_create_homepage_settings.sql	2025-08-24 03:34:03.044634	started	\N	\N	0
37	006_create_homepage_settings.sql	2025-08-24 03:34:03.044634	completed	\N	\N	10
1266	005_create_featured_reviews.sql	2025-08-24 06:15:56.282899	started	\N	\N	0
39	001_backup_preparation.sql	2025-08-24 03:34:30.646586	completed	\N	\N	0
40	002_create_tour_categories.sql	2025-08-24 03:34:30.689606	started	\N	\N	0
41	002_create_tour_categories.sql	2025-08-24 03:34:30.689606	completed	\N	\N	8
42	003_create_special_offers.sql	2025-08-24 03:34:30.934287	started	\N	\N	0
43	003_create_special_offers.sql	2025-08-24 03:34:30.934287	completed	\N	\N	3
1267	005_create_featured_reviews.sql	2025-08-24 06:15:56.282899	completed	\N	\N	5
45	001_backup_preparation.sql	2025-08-24 03:34:52.384708	completed	\N	\N	0
46	002_create_tour_categories.sql	2025-08-24 03:34:52.446683	started	\N	\N	0
47	002_create_tour_categories.sql	2025-08-24 03:34:52.446683	completed	\N	\N	8
48	003_create_special_offers.sql	2025-08-24 03:34:52.701133	started	\N	\N	0
49	003_create_special_offers.sql	2025-08-24 03:34:52.701133	completed	\N	\N	3
50	004_create_tour_statistics.sql	2025-08-24 03:34:53.048505	started	\N	\N	0
51	004_create_tour_statistics.sql	2025-08-24 03:34:53.048505	completed	\N	\N	0
52	005_create_featured_reviews.sql	2025-08-24 03:34:53.398323	started	\N	\N	0
53	005_create_featured_reviews.sql	2025-08-24 03:34:53.398323	completed	\N	\N	5
54	006_create_homepage_settings.sql	2025-08-24 03:34:53.857809	started	\N	\N	0
55	006_create_homepage_settings.sql	2025-08-24 03:34:53.857809	completed	\N	\N	10
1268	006_create_homepage_settings.sql	2025-08-24 06:15:56.716671	started	\N	\N	0
57	001_backup_preparation.sql	2025-08-24 03:35:21.257646	completed	\N	\N	0
58	002_create_tour_categories.sql	2025-08-24 03:35:21.304458	started	\N	\N	0
59	002_create_tour_categories.sql	2025-08-24 03:35:21.304458	completed	\N	\N	8
60	003_create_special_offers.sql	2025-08-24 03:35:21.60952	started	\N	\N	0
61	003_create_special_offers.sql	2025-08-24 03:35:21.60952	completed	\N	\N	3
62	004_create_tour_statistics.sql	2025-08-24 03:35:22.037719	started	\N	\N	0
63	004_create_tour_statistics.sql	2025-08-24 03:35:22.037719	completed	\N	\N	0
64	005_create_featured_reviews.sql	2025-08-24 03:35:22.504031	started	\N	\N	0
65	005_create_featured_reviews.sql	2025-08-24 03:35:22.504031	completed	\N	\N	5
66	006_create_homepage_settings.sql	2025-08-24 03:35:23.086322	started	\N	\N	0
67	006_create_homepage_settings.sql	2025-08-24 03:35:23.086322	completed	\N	\N	10
1269	006_create_homepage_settings.sql	2025-08-24 06:15:56.716671	completed	\N	\N	10
69	001_backup_preparation.sql	2025-08-24 03:35:53.297884	completed	\N	\N	0
70	002_create_tour_categories.sql	2025-08-24 03:35:53.35712	started	\N	\N	0
71	002_create_tour_categories.sql	2025-08-24 03:35:53.35712	completed	\N	\N	8
72	003_create_special_offers.sql	2025-08-24 03:35:53.610264	started	\N	\N	0
73	003_create_special_offers.sql	2025-08-24 03:35:53.610264	completed	\N	\N	3
74	004_create_tour_statistics.sql	2025-08-24 03:35:54.056503	started	\N	\N	0
75	004_create_tour_statistics.sql	2025-08-24 03:35:54.056503	completed	\N	\N	0
76	005_create_featured_reviews.sql	2025-08-24 03:35:54.553641	started	\N	\N	0
77	005_create_featured_reviews.sql	2025-08-24 03:35:54.553641	completed	\N	\N	5
78	006_create_homepage_settings.sql	2025-08-24 03:35:55.130917	started	\N	\N	0
79	006_create_homepage_settings.sql	2025-08-24 03:35:55.130917	completed	\N	\N	10
81	001_backup_preparation.sql	2025-08-24 03:36:14.932732	completed	\N	\N	0
82	002_create_tour_categories.sql	2025-08-24 03:36:14.983401	started	\N	\N	0
83	002_create_tour_categories.sql	2025-08-24 03:36:14.983401	completed	\N	\N	8
84	003_create_special_offers.sql	2025-08-24 03:36:15.230223	started	\N	\N	0
85	003_create_special_offers.sql	2025-08-24 03:36:15.230223	completed	\N	\N	3
86	004_create_tour_statistics.sql	2025-08-24 03:36:15.643097	started	\N	\N	0
87	004_create_tour_statistics.sql	2025-08-24 03:36:15.643097	completed	\N	\N	0
88	005_create_featured_reviews.sql	2025-08-24 03:36:16.094629	started	\N	\N	0
89	005_create_featured_reviews.sql	2025-08-24 03:36:16.094629	completed	\N	\N	5
90	006_create_homepage_settings.sql	2025-08-24 03:36:16.751074	started	\N	\N	0
91	006_create_homepage_settings.sql	2025-08-24 03:36:16.751074	completed	\N	\N	10
1207	016_remove_duration_difficulty_fields.sql	2025-08-24 06:03:25.615913	started	\N	\N	0
93	001_backup_preparation.sql	2025-08-24 03:36:37.527527	completed	\N	\N	0
94	002_create_tour_categories.sql	2025-08-24 03:36:37.595788	started	\N	\N	0
95	002_create_tour_categories.sql	2025-08-24 03:36:37.595788	completed	\N	\N	8
96	003_create_special_offers.sql	2025-08-24 03:36:37.90711	started	\N	\N	0
97	003_create_special_offers.sql	2025-08-24 03:36:37.90711	completed	\N	\N	3
98	004_create_tour_statistics.sql	2025-08-24 03:36:38.411241	started	\N	\N	0
99	004_create_tour_statistics.sql	2025-08-24 03:36:38.411241	completed	\N	\N	0
100	005_create_featured_reviews.sql	2025-08-24 03:36:38.838082	started	\N	\N	0
101	005_create_featured_reviews.sql	2025-08-24 03:36:38.838082	completed	\N	\N	5
102	006_create_homepage_settings.sql	2025-08-24 03:36:39.348414	started	\N	\N	0
103	006_create_homepage_settings.sql	2025-08-24 03:36:39.348414	completed	\N	\N	10
104	007_enrich_tours_table.sql	2025-08-24 03:36:39.795386	started	\N	\N	0
105	007_enrich_tours_table.sql	2025-08-24 03:36:39.795386	completed	\N	\N	6
1208	016_remove_duration_difficulty_fields.sql	2025-08-24 06:03:25.615913	completed	\N	\N	0
107	001_backup_preparation.sql	2025-08-24 03:37:00.098265	completed	\N	\N	0
108	002_create_tour_categories.sql	2025-08-24 03:37:00.150944	started	\N	\N	0
109	002_create_tour_categories.sql	2025-08-24 03:37:00.150944	completed	\N	\N	8
110	003_create_special_offers.sql	2025-08-24 03:37:00.453822	started	\N	\N	0
111	003_create_special_offers.sql	2025-08-24 03:37:00.453822	completed	\N	\N	3
112	004_create_tour_statistics.sql	2025-08-24 03:37:00.919511	started	\N	\N	0
113	004_create_tour_statistics.sql	2025-08-24 03:37:00.919511	completed	\N	\N	0
114	005_create_featured_reviews.sql	2025-08-24 03:37:01.439481	started	\N	\N	0
115	005_create_featured_reviews.sql	2025-08-24 03:37:01.439481	completed	\N	\N	5
116	006_create_homepage_settings.sql	2025-08-24 03:37:02.108863	started	\N	\N	0
117	006_create_homepage_settings.sql	2025-08-24 03:37:02.108863	completed	\N	\N	10
1270	007_enrich_tours_table.sql	2025-08-24 06:15:57.169217	started	\N	\N	0
119	001_backup_preparation.sql	2025-08-24 03:37:50.328922	completed	\N	\N	0
120	002_create_tour_categories.sql	2025-08-24 03:37:50.396148	started	\N	\N	0
121	002_create_tour_categories.sql	2025-08-24 03:37:50.396148	completed	\N	\N	8
122	003_create_special_offers.sql	2025-08-24 03:37:50.867981	started	\N	\N	0
123	003_create_special_offers.sql	2025-08-24 03:37:50.867981	completed	\N	\N	3
124	004_create_tour_statistics.sql	2025-08-24 03:37:51.386346	started	\N	\N	0
125	004_create_tour_statistics.sql	2025-08-24 03:37:51.386346	completed	\N	\N	0
126	005_create_featured_reviews.sql	2025-08-24 03:37:51.845094	started	\N	\N	0
127	005_create_featured_reviews.sql	2025-08-24 03:37:51.845094	completed	\N	\N	5
128	006_create_homepage_settings.sql	2025-08-24 03:37:52.397935	started	\N	\N	0
129	006_create_homepage_settings.sql	2025-08-24 03:37:52.397935	completed	\N	\N	10
1271	007_enrich_tours_table.sql	2025-08-24 06:15:57.169217	completed	\N	\N	6
131	001_backup_preparation.sql	2025-08-24 03:38:26.348528	completed	\N	\N	0
132	002_create_tour_categories.sql	2025-08-24 03:38:26.453537	started	\N	\N	0
133	002_create_tour_categories.sql	2025-08-24 03:38:26.453537	completed	\N	\N	8
134	003_create_special_offers.sql	2025-08-24 03:38:26.804866	started	\N	\N	0
135	003_create_special_offers.sql	2025-08-24 03:38:26.804866	completed	\N	\N	3
136	004_create_tour_statistics.sql	2025-08-24 03:38:27.49817	started	\N	\N	0
137	004_create_tour_statistics.sql	2025-08-24 03:38:27.49817	completed	\N	\N	0
138	005_create_featured_reviews.sql	2025-08-24 03:38:28.134953	started	\N	\N	0
139	005_create_featured_reviews.sql	2025-08-24 03:38:28.134953	completed	\N	\N	5
140	006_create_homepage_settings.sql	2025-08-24 03:38:28.913327	started	\N	\N	0
141	006_create_homepage_settings.sql	2025-08-24 03:38:28.913327	completed	\N	\N	10
1272	008_enrich_blog_posts_table.sql	2025-08-24 06:15:57.799866	started	\N	\N	0
143	001_backup_preparation.sql	2025-08-24 03:38:50.553113	completed	\N	\N	0
144	002_create_tour_categories.sql	2025-08-24 03:38:50.689095	started	\N	\N	0
145	002_create_tour_categories.sql	2025-08-24 03:38:50.689095	completed	\N	\N	8
146	003_create_special_offers.sql	2025-08-24 03:38:50.997292	started	\N	\N	0
147	003_create_special_offers.sql	2025-08-24 03:38:50.997292	completed	\N	\N	3
148	004_create_tour_statistics.sql	2025-08-24 03:38:51.622523	started	\N	\N	0
149	004_create_tour_statistics.sql	2025-08-24 03:38:51.622523	completed	\N	\N	0
150	005_create_featured_reviews.sql	2025-08-24 03:38:52.195208	started	\N	\N	0
151	005_create_featured_reviews.sql	2025-08-24 03:38:52.195208	completed	\N	\N	5
152	006_create_homepage_settings.sql	2025-08-24 03:38:52.929499	started	\N	\N	0
153	006_create_homepage_settings.sql	2025-08-24 03:38:52.929499	completed	\N	\N	10
154	007_enrich_tours_table.sql	2025-08-24 03:38:53.391079	started	\N	\N	0
155	007_enrich_tours_table.sql	2025-08-24 03:38:53.391079	completed	\N	\N	6
1303	001_backup_preparation.sql	2025-08-24 06:21:52.992264	completed	\N	\N	0
157	001_backup_preparation.sql	2025-08-24 03:39:17.883518	completed	\N	\N	0
158	002_create_tour_categories.sql	2025-08-24 03:39:17.935319	started	\N	\N	0
159	002_create_tour_categories.sql	2025-08-24 03:39:17.935319	completed	\N	\N	8
160	003_create_special_offers.sql	2025-08-24 03:39:18.236392	started	\N	\N	0
161	003_create_special_offers.sql	2025-08-24 03:39:18.236392	completed	\N	\N	3
162	004_create_tour_statistics.sql	2025-08-24 03:39:18.626248	started	\N	\N	0
163	004_create_tour_statistics.sql	2025-08-24 03:39:18.626248	completed	\N	\N	0
164	005_create_featured_reviews.sql	2025-08-24 03:39:18.99542	started	\N	\N	0
165	005_create_featured_reviews.sql	2025-08-24 03:39:18.99542	completed	\N	\N	5
166	006_create_homepage_settings.sql	2025-08-24 03:39:19.506377	started	\N	\N	0
167	006_create_homepage_settings.sql	2025-08-24 03:39:19.506377	completed	\N	\N	10
168	007_enrich_tours_table.sql	2025-08-24 03:39:20.259561	started	\N	\N	0
169	007_enrich_tours_table.sql	2025-08-24 03:39:20.259561	completed	\N	\N	6
170	008_enrich_blog_posts_table.sql	2025-08-24 03:39:21.20363	started	\N	\N	0
171	008_enrich_blog_posts_table.sql	2025-08-24 03:39:21.20363	completed	\N	\N	0
173	001_backup_preparation.sql	2025-08-24 03:40:31.973987	completed	\N	\N	0
174	002_create_tour_categories.sql	2025-08-24 03:40:32.035956	started	\N	\N	0
175	002_create_tour_categories.sql	2025-08-24 03:40:32.035956	completed	\N	\N	8
176	003_create_special_offers.sql	2025-08-24 03:40:32.397189	started	\N	\N	0
177	003_create_special_offers.sql	2025-08-24 03:40:32.397189	completed	\N	\N	3
178	004_create_tour_statistics.sql	2025-08-24 03:40:32.881908	started	\N	\N	0
179	004_create_tour_statistics.sql	2025-08-24 03:40:32.881908	completed	\N	\N	0
180	005_create_featured_reviews.sql	2025-08-24 03:40:33.298647	started	\N	\N	0
181	005_create_featured_reviews.sql	2025-08-24 03:40:33.298647	completed	\N	\N	5
182	006_create_homepage_settings.sql	2025-08-24 03:40:33.745772	started	\N	\N	0
183	006_create_homepage_settings.sql	2025-08-24 03:40:33.745772	completed	\N	\N	10
184	007_enrich_tours_table.sql	2025-08-24 03:40:34.268892	started	\N	\N	0
185	007_enrich_tours_table.sql	2025-08-24 03:40:34.268892	completed	\N	\N	6
186	008_enrich_blog_posts_table.sql	2025-08-24 03:40:35.214698	started	\N	\N	0
187	008_enrich_blog_posts_table.sql	2025-08-24 03:40:35.214698	completed	\N	\N	0
188	009_enrich_destinations_table.sql	2025-08-24 03:40:36.205506	started	\N	\N	0
189	009_enrich_destinations_table.sql	2025-08-24 03:40:36.205506	completed	\N	\N	6
1209	016_remove_duration_difficulty_fields.sql	2025-08-24 06:04:24.778296	started	\N	\N	0
191	001_backup_preparation.sql	2025-08-24 03:41:10.622218	completed	\N	\N	0
192	002_create_tour_categories.sql	2025-08-24 03:41:10.70665	started	\N	\N	0
193	002_create_tour_categories.sql	2025-08-24 03:41:10.70665	completed	\N	\N	8
194	003_create_special_offers.sql	2025-08-24 03:41:11.011679	started	\N	\N	0
195	003_create_special_offers.sql	2025-08-24 03:41:11.011679	completed	\N	\N	3
196	004_create_tour_statistics.sql	2025-08-24 03:41:11.476445	started	\N	\N	0
197	004_create_tour_statistics.sql	2025-08-24 03:41:11.476445	completed	\N	\N	0
198	005_create_featured_reviews.sql	2025-08-24 03:41:11.907901	started	\N	\N	0
199	005_create_featured_reviews.sql	2025-08-24 03:41:11.907901	completed	\N	\N	5
200	006_create_homepage_settings.sql	2025-08-24 03:41:12.350634	started	\N	\N	0
201	006_create_homepage_settings.sql	2025-08-24 03:41:12.350634	completed	\N	\N	10
202	007_enrich_tours_table.sql	2025-08-24 03:41:12.769147	started	\N	\N	0
203	007_enrich_tours_table.sql	2025-08-24 03:41:12.769147	completed	\N	\N	6
204	008_enrich_blog_posts_table.sql	2025-08-24 03:41:13.513127	started	\N	\N	0
205	008_enrich_blog_posts_table.sql	2025-08-24 03:41:13.513127	completed	\N	\N	0
206	009_enrich_destinations_table.sql	2025-08-24 03:41:14.212667	started	\N	\N	0
207	009_enrich_destinations_table.sql	2025-08-24 03:41:14.212667	completed	\N	\N	6
1210	016_remove_duration_difficulty_fields.sql	2025-08-24 06:04:24.778296	completed	\N	\N	0
209	001_backup_preparation.sql	2025-08-24 03:42:04.258983	completed	\N	\N	0
210	002_create_tour_categories.sql	2025-08-24 03:42:04.311481	started	\N	\N	0
211	002_create_tour_categories.sql	2025-08-24 03:42:04.311481	completed	\N	\N	8
212	003_create_special_offers.sql	2025-08-24 03:42:04.585959	started	\N	\N	0
213	003_create_special_offers.sql	2025-08-24 03:42:04.585959	completed	\N	\N	3
214	004_create_tour_statistics.sql	2025-08-24 03:42:04.944485	started	\N	\N	0
215	004_create_tour_statistics.sql	2025-08-24 03:42:04.944485	completed	\N	\N	0
216	005_create_featured_reviews.sql	2025-08-24 03:42:05.277957	started	\N	\N	0
217	005_create_featured_reviews.sql	2025-08-24 03:42:05.277957	completed	\N	\N	5
218	006_create_homepage_settings.sql	2025-08-24 03:42:05.734443	started	\N	\N	0
219	006_create_homepage_settings.sql	2025-08-24 03:42:05.734443	completed	\N	\N	10
220	007_enrich_tours_table.sql	2025-08-24 03:42:06.202691	started	\N	\N	0
221	007_enrich_tours_table.sql	2025-08-24 03:42:06.202691	completed	\N	\N	6
222	008_enrich_blog_posts_table.sql	2025-08-24 03:42:07.016768	started	\N	\N	0
223	008_enrich_blog_posts_table.sql	2025-08-24 03:42:07.016768	completed	\N	\N	0
224	009_enrich_destinations_table.sql	2025-08-24 03:42:07.979361	started	\N	\N	0
225	009_enrich_destinations_table.sql	2025-08-24 03:42:07.979361	completed	\N	\N	6
1273	008_enrich_blog_posts_table.sql	2025-08-24 06:15:57.799866	completed	\N	\N	0
227	001_backup_preparation.sql	2025-08-24 03:42:41.131136	completed	\N	\N	0
228	002_create_tour_categories.sql	2025-08-24 03:42:41.197247	started	\N	\N	0
229	002_create_tour_categories.sql	2025-08-24 03:42:41.197247	completed	\N	\N	8
230	003_create_special_offers.sql	2025-08-24 03:42:41.50893	started	\N	\N	0
231	003_create_special_offers.sql	2025-08-24 03:42:41.50893	completed	\N	\N	3
232	004_create_tour_statistics.sql	2025-08-24 03:42:41.971745	started	\N	\N	0
233	004_create_tour_statistics.sql	2025-08-24 03:42:41.971745	completed	\N	\N	0
234	005_create_featured_reviews.sql	2025-08-24 03:42:42.43903	started	\N	\N	0
235	005_create_featured_reviews.sql	2025-08-24 03:42:42.43903	completed	\N	\N	5
236	006_create_homepage_settings.sql	2025-08-24 03:42:42.88494	started	\N	\N	0
237	006_create_homepage_settings.sql	2025-08-24 03:42:42.88494	completed	\N	\N	10
238	007_enrich_tours_table.sql	2025-08-24 03:42:43.300899	started	\N	\N	0
239	007_enrich_tours_table.sql	2025-08-24 03:42:43.300899	completed	\N	\N	6
240	008_enrich_blog_posts_table.sql	2025-08-24 03:42:44.160016	started	\N	\N	0
241	008_enrich_blog_posts_table.sql	2025-08-24 03:42:44.160016	completed	\N	\N	0
242	009_enrich_destinations_table.sql	2025-08-24 03:42:45.063843	started	\N	\N	0
243	009_enrich_destinations_table.sql	2025-08-24 03:42:45.063843	completed	\N	\N	6
1274	009_enrich_destinations_table.sql	2025-08-24 06:15:58.52114	started	\N	\N	0
245	001_backup_preparation.sql	2025-08-24 03:43:17.788151	completed	\N	\N	0
246	002_create_tour_categories.sql	2025-08-24 03:43:17.867051	started	\N	\N	0
247	002_create_tour_categories.sql	2025-08-24 03:43:17.867051	completed	\N	\N	8
248	003_create_special_offers.sql	2025-08-24 03:43:18.191649	started	\N	\N	0
249	003_create_special_offers.sql	2025-08-24 03:43:18.191649	completed	\N	\N	3
250	004_create_tour_statistics.sql	2025-08-24 03:43:18.664745	started	\N	\N	0
251	004_create_tour_statistics.sql	2025-08-24 03:43:18.664745	completed	\N	\N	0
252	005_create_featured_reviews.sql	2025-08-24 03:43:19.103033	started	\N	\N	0
253	005_create_featured_reviews.sql	2025-08-24 03:43:19.103033	completed	\N	\N	5
254	006_create_homepage_settings.sql	2025-08-24 03:43:19.661939	started	\N	\N	0
255	006_create_homepage_settings.sql	2025-08-24 03:43:19.661939	completed	\N	\N	10
256	007_enrich_tours_table.sql	2025-08-24 03:43:20.108255	started	\N	\N	0
257	007_enrich_tours_table.sql	2025-08-24 03:43:20.108255	completed	\N	\N	6
258	008_enrich_blog_posts_table.sql	2025-08-24 03:43:20.856769	started	\N	\N	0
259	008_enrich_blog_posts_table.sql	2025-08-24 03:43:20.856769	completed	\N	\N	0
260	009_enrich_destinations_table.sql	2025-08-24 03:43:21.537409	started	\N	\N	0
261	009_enrich_destinations_table.sql	2025-08-24 03:43:21.537409	completed	\N	\N	6
1275	009_enrich_destinations_table.sql	2025-08-24 06:15:58.52114	completed	\N	\N	6
263	001_backup_preparation.sql	2025-08-24 03:43:46.468824	completed	\N	\N	0
264	002_create_tour_categories.sql	2025-08-24 03:43:46.524217	started	\N	\N	0
265	002_create_tour_categories.sql	2025-08-24 03:43:46.524217	completed	\N	\N	8
266	003_create_special_offers.sql	2025-08-24 03:43:46.807024	started	\N	\N	0
267	003_create_special_offers.sql	2025-08-24 03:43:46.807024	completed	\N	\N	3
268	004_create_tour_statistics.sql	2025-08-24 03:43:47.158731	started	\N	\N	0
269	004_create_tour_statistics.sql	2025-08-24 03:43:47.158731	completed	\N	\N	0
270	005_create_featured_reviews.sql	2025-08-24 03:43:47.582363	started	\N	\N	0
271	005_create_featured_reviews.sql	2025-08-24 03:43:47.582363	completed	\N	\N	5
272	006_create_homepage_settings.sql	2025-08-24 03:43:48.239895	started	\N	\N	0
273	006_create_homepage_settings.sql	2025-08-24 03:43:48.239895	completed	\N	\N	10
274	007_enrich_tours_table.sql	2025-08-24 03:43:48.790308	started	\N	\N	0
275	007_enrich_tours_table.sql	2025-08-24 03:43:48.790308	completed	\N	\N	6
276	008_enrich_blog_posts_table.sql	2025-08-24 03:43:49.583651	started	\N	\N	0
277	008_enrich_blog_posts_table.sql	2025-08-24 03:43:49.583651	completed	\N	\N	0
278	009_enrich_destinations_table.sql	2025-08-24 03:43:50.27926	started	\N	\N	0
279	009_enrich_destinations_table.sql	2025-08-24 03:43:50.27926	completed	\N	\N	6
1211	001_backup_preparation.sql	2025-08-24 06:13:20.535325	completed	\N	\N	0
281	001_backup_preparation.sql	2025-08-24 03:44:18.124439	completed	\N	\N	0
282	002_create_tour_categories.sql	2025-08-24 03:44:18.188199	started	\N	\N	0
283	002_create_tour_categories.sql	2025-08-24 03:44:18.188199	completed	\N	\N	8
284	003_create_special_offers.sql	2025-08-24 03:44:18.504934	started	\N	\N	0
285	003_create_special_offers.sql	2025-08-24 03:44:18.504934	completed	\N	\N	3
286	004_create_tour_statistics.sql	2025-08-24 03:44:18.98957	started	\N	\N	0
287	004_create_tour_statistics.sql	2025-08-24 03:44:18.98957	completed	\N	\N	0
288	005_create_featured_reviews.sql	2025-08-24 03:44:19.381881	started	\N	\N	0
289	005_create_featured_reviews.sql	2025-08-24 03:44:19.381881	completed	\N	\N	5
290	006_create_homepage_settings.sql	2025-08-24 03:44:19.91475	started	\N	\N	0
291	006_create_homepage_settings.sql	2025-08-24 03:44:19.91475	completed	\N	\N	10
292	007_enrich_tours_table.sql	2025-08-24 03:44:20.381763	started	\N	\N	0
293	007_enrich_tours_table.sql	2025-08-24 03:44:20.381763	completed	\N	\N	6
294	008_enrich_blog_posts_table.sql	2025-08-24 03:44:21.333403	started	\N	\N	0
295	008_enrich_blog_posts_table.sql	2025-08-24 03:44:21.333403	completed	\N	\N	0
296	009_enrich_destinations_table.sql	2025-08-24 03:44:22.173891	started	\N	\N	0
297	009_enrich_destinations_table.sql	2025-08-24 03:44:22.173891	completed	\N	\N	6
1212	002_create_tour_categories.sql	2025-08-24 06:13:20.60551	started	\N	\N	0
299	001_backup_preparation.sql	2025-08-24 03:44:48.026916	completed	\N	\N	0
300	002_create_tour_categories.sql	2025-08-24 03:44:48.082118	started	\N	\N	0
301	002_create_tour_categories.sql	2025-08-24 03:44:48.082118	completed	\N	\N	8
302	003_create_special_offers.sql	2025-08-24 03:44:48.481754	started	\N	\N	0
303	003_create_special_offers.sql	2025-08-24 03:44:48.481754	completed	\N	\N	3
304	004_create_tour_statistics.sql	2025-08-24 03:44:48.963774	started	\N	\N	0
305	004_create_tour_statistics.sql	2025-08-24 03:44:48.963774	completed	\N	\N	0
306	005_create_featured_reviews.sql	2025-08-24 03:44:49.384509	started	\N	\N	0
307	005_create_featured_reviews.sql	2025-08-24 03:44:49.384509	completed	\N	\N	5
308	006_create_homepage_settings.sql	2025-08-24 03:44:49.896437	started	\N	\N	0
309	006_create_homepage_settings.sql	2025-08-24 03:44:49.896437	completed	\N	\N	10
310	007_enrich_tours_table.sql	2025-08-24 03:44:50.491753	started	\N	\N	0
311	007_enrich_tours_table.sql	2025-08-24 03:44:50.491753	completed	\N	\N	6
312	008_enrich_blog_posts_table.sql	2025-08-24 03:44:51.558826	started	\N	\N	0
313	008_enrich_blog_posts_table.sql	2025-08-24 03:44:51.558826	completed	\N	\N	0
314	009_enrich_destinations_table.sql	2025-08-24 03:44:52.312571	started	\N	\N	0
315	009_enrich_destinations_table.sql	2025-08-24 03:44:52.312571	completed	\N	\N	6
1213	002_create_tour_categories.sql	2025-08-24 06:13:20.60551	completed	\N	\N	8
317	001_backup_preparation.sql	2025-08-24 03:45:24.707078	completed	\N	\N	0
318	002_create_tour_categories.sql	2025-08-24 03:45:24.783102	started	\N	\N	0
319	002_create_tour_categories.sql	2025-08-24 03:45:24.783102	completed	\N	\N	8
320	003_create_special_offers.sql	2025-08-24 03:45:25.061551	started	\N	\N	0
321	003_create_special_offers.sql	2025-08-24 03:45:25.061551	completed	\N	\N	3
322	004_create_tour_statistics.sql	2025-08-24 03:45:25.508368	started	\N	\N	0
323	004_create_tour_statistics.sql	2025-08-24 03:45:25.508368	completed	\N	\N	0
324	005_create_featured_reviews.sql	2025-08-24 03:45:26.02774	started	\N	\N	0
325	005_create_featured_reviews.sql	2025-08-24 03:45:26.02774	completed	\N	\N	5
326	006_create_homepage_settings.sql	2025-08-24 03:45:26.57462	started	\N	\N	0
327	006_create_homepage_settings.sql	2025-08-24 03:45:26.57462	completed	\N	\N	10
328	007_enrich_tours_table.sql	2025-08-24 03:45:27.049628	started	\N	\N	0
329	007_enrich_tours_table.sql	2025-08-24 03:45:27.049628	completed	\N	\N	6
330	008_enrich_blog_posts_table.sql	2025-08-24 03:45:27.733292	started	\N	\N	0
331	008_enrich_blog_posts_table.sql	2025-08-24 03:45:27.733292	completed	\N	\N	0
332	009_enrich_destinations_table.sql	2025-08-24 03:45:28.429494	started	\N	\N	0
333	009_enrich_destinations_table.sql	2025-08-24 03:45:28.429494	completed	\N	\N	6
335	001_backup_preparation.sql	2025-08-24 03:45:50.818119	completed	\N	\N	0
336	002_create_tour_categories.sql	2025-08-24 03:45:50.865907	started	\N	\N	0
337	002_create_tour_categories.sql	2025-08-24 03:45:50.865907	completed	\N	\N	8
338	003_create_special_offers.sql	2025-08-24 03:45:51.204534	started	\N	\N	0
339	003_create_special_offers.sql	2025-08-24 03:45:51.204534	completed	\N	\N	3
340	004_create_tour_statistics.sql	2025-08-24 03:45:51.670377	started	\N	\N	0
341	004_create_tour_statistics.sql	2025-08-24 03:45:51.670377	completed	\N	\N	0
342	005_create_featured_reviews.sql	2025-08-24 03:45:52.168846	started	\N	\N	0
343	005_create_featured_reviews.sql	2025-08-24 03:45:52.168846	completed	\N	\N	5
344	006_create_homepage_settings.sql	2025-08-24 03:45:52.704772	started	\N	\N	0
345	006_create_homepage_settings.sql	2025-08-24 03:45:52.704772	completed	\N	\N	10
346	007_enrich_tours_table.sql	2025-08-24 03:45:53.172875	started	\N	\N	0
347	007_enrich_tours_table.sql	2025-08-24 03:45:53.172875	completed	\N	\N	6
348	008_enrich_blog_posts_table.sql	2025-08-24 03:45:53.88899	started	\N	\N	0
349	008_enrich_blog_posts_table.sql	2025-08-24 03:45:53.88899	completed	\N	\N	0
350	009_enrich_destinations_table.sql	2025-08-24 03:45:54.577388	started	\N	\N	0
351	009_enrich_destinations_table.sql	2025-08-24 03:45:54.577388	completed	\N	\N	6
1276	010_create_foreign_keys_constraints.sql	2025-08-24 06:15:59.803309	started	\N	\N	0
353	001_backup_preparation.sql	2025-08-24 03:48:22.674527	completed	\N	\N	0
354	002_create_tour_categories.sql	2025-08-24 03:48:22.722959	started	\N	\N	0
355	002_create_tour_categories.sql	2025-08-24 03:48:22.722959	completed	\N	\N	8
356	003_create_special_offers.sql	2025-08-24 03:48:23.026639	started	\N	\N	0
357	003_create_special_offers.sql	2025-08-24 03:48:23.026639	completed	\N	\N	3
358	004_create_tour_statistics.sql	2025-08-24 03:48:23.454058	started	\N	\N	0
1277	010_create_foreign_keys_constraints.sql	2025-08-24 06:15:59.803309	completed	\N	\N	0
359	004_create_tour_statistics.sql	2025-08-24 03:48:23.454058	completed	\N	\N	0
360	005_create_featured_reviews.sql	2025-08-24 03:48:23.819745	started	\N	\N	0
361	005_create_featured_reviews.sql	2025-08-24 03:48:23.819745	completed	\N	\N	5
362	006_create_homepage_settings.sql	2025-08-24 03:48:24.34356	started	\N	\N	0
363	006_create_homepage_settings.sql	2025-08-24 03:48:24.34356	completed	\N	\N	10
364	007_enrich_tours_table.sql	2025-08-24 03:48:24.80507	started	\N	\N	0
365	007_enrich_tours_table.sql	2025-08-24 03:48:24.80507	completed	\N	\N	6
366	008_enrich_blog_posts_table.sql	2025-08-24 03:48:25.562802	started	\N	\N	0
367	008_enrich_blog_posts_table.sql	2025-08-24 03:48:25.562802	completed	\N	\N	0
368	009_enrich_destinations_table.sql	2025-08-24 03:48:26.222412	started	\N	\N	0
369	009_enrich_destinations_table.sql	2025-08-24 03:48:26.222412	completed	\N	\N	6
1215	001_backup_preparation.sql	2025-08-24 06:13:57.558333	completed	\N	\N	0
371	001_backup_preparation.sql	2025-08-24 03:48:59.624772	completed	\N	\N	0
372	002_create_tour_categories.sql	2025-08-24 03:48:59.700676	started	\N	\N	0
373	002_create_tour_categories.sql	2025-08-24 03:48:59.700676	completed	\N	\N	8
374	003_create_special_offers.sql	2025-08-24 03:48:59.944615	started	\N	\N	0
375	003_create_special_offers.sql	2025-08-24 03:48:59.944615	completed	\N	\N	3
376	004_create_tour_statistics.sql	2025-08-24 03:49:00.287484	started	\N	\N	0
377	004_create_tour_statistics.sql	2025-08-24 03:49:00.287484	completed	\N	\N	0
378	005_create_featured_reviews.sql	2025-08-24 03:49:00.630153	started	\N	\N	0
379	005_create_featured_reviews.sql	2025-08-24 03:49:00.630153	completed	\N	\N	5
380	006_create_homepage_settings.sql	2025-08-24 03:49:01.071395	started	\N	\N	0
381	006_create_homepage_settings.sql	2025-08-24 03:49:01.071395	completed	\N	\N	10
382	007_enrich_tours_table.sql	2025-08-24 03:49:01.555041	started	\N	\N	0
383	007_enrich_tours_table.sql	2025-08-24 03:49:01.555041	completed	\N	\N	6
384	008_enrich_blog_posts_table.sql	2025-08-24 03:49:02.463989	started	\N	\N	0
385	008_enrich_blog_posts_table.sql	2025-08-24 03:49:02.463989	completed	\N	\N	0
386	009_enrich_destinations_table.sql	2025-08-24 03:49:03.431711	started	\N	\N	0
387	009_enrich_destinations_table.sql	2025-08-24 03:49:03.431711	completed	\N	\N	6
1216	002_create_tour_categories.sql	2025-08-24 06:13:57.628393	started	\N	\N	0
389	001_backup_preparation.sql	2025-08-24 03:49:37.116275	completed	\N	\N	0
390	002_create_tour_categories.sql	2025-08-24 03:49:37.16932	started	\N	\N	0
391	002_create_tour_categories.sql	2025-08-24 03:49:37.16932	completed	\N	\N	8
392	003_create_special_offers.sql	2025-08-24 03:49:37.474588	started	\N	\N	0
393	003_create_special_offers.sql	2025-08-24 03:49:37.474588	completed	\N	\N	3
394	004_create_tour_statistics.sql	2025-08-24 03:49:37.945234	started	\N	\N	0
395	004_create_tour_statistics.sql	2025-08-24 03:49:37.945234	completed	\N	\N	0
396	005_create_featured_reviews.sql	2025-08-24 03:49:38.388668	started	\N	\N	0
397	005_create_featured_reviews.sql	2025-08-24 03:49:38.388668	completed	\N	\N	5
398	006_create_homepage_settings.sql	2025-08-24 03:49:38.873676	started	\N	\N	0
399	006_create_homepage_settings.sql	2025-08-24 03:49:38.873676	completed	\N	\N	10
400	007_enrich_tours_table.sql	2025-08-24 03:49:39.298526	started	\N	\N	0
401	007_enrich_tours_table.sql	2025-08-24 03:49:39.298526	completed	\N	\N	6
402	008_enrich_blog_posts_table.sql	2025-08-24 03:49:40.086563	started	\N	\N	0
403	008_enrich_blog_posts_table.sql	2025-08-24 03:49:40.086563	completed	\N	\N	0
404	009_enrich_destinations_table.sql	2025-08-24 03:49:40.963184	started	\N	\N	0
405	009_enrich_destinations_table.sql	2025-08-24 03:49:40.963184	completed	\N	\N	6
1217	002_create_tour_categories.sql	2025-08-24 06:13:57.628393	completed	\N	\N	8
407	001_backup_preparation.sql	2025-08-24 03:50:16.823203	completed	\N	\N	0
408	002_create_tour_categories.sql	2025-08-24 03:50:16.906658	started	\N	\N	0
409	002_create_tour_categories.sql	2025-08-24 03:50:16.906658	completed	\N	\N	8
410	003_create_special_offers.sql	2025-08-24 03:50:17.249071	started	\N	\N	0
411	003_create_special_offers.sql	2025-08-24 03:50:17.249071	completed	\N	\N	3
412	004_create_tour_statistics.sql	2025-08-24 03:50:17.773859	started	\N	\N	0
413	004_create_tour_statistics.sql	2025-08-24 03:50:17.773859	completed	\N	\N	0
414	005_create_featured_reviews.sql	2025-08-24 03:50:18.270218	started	\N	\N	0
415	005_create_featured_reviews.sql	2025-08-24 03:50:18.270218	completed	\N	\N	5
416	006_create_homepage_settings.sql	2025-08-24 03:50:18.814337	started	\N	\N	0
417	006_create_homepage_settings.sql	2025-08-24 03:50:18.814337	completed	\N	\N	10
418	007_enrich_tours_table.sql	2025-08-24 03:50:19.252673	started	\N	\N	0
419	007_enrich_tours_table.sql	2025-08-24 03:50:19.252673	completed	\N	\N	6
420	008_enrich_blog_posts_table.sql	2025-08-24 03:50:20.050524	started	\N	\N	0
421	008_enrich_blog_posts_table.sql	2025-08-24 03:50:20.050524	completed	\N	\N	0
422	009_enrich_destinations_table.sql	2025-08-24 03:50:20.922025	started	\N	\N	0
423	009_enrich_destinations_table.sql	2025-08-24 03:50:20.922025	completed	\N	\N	6
1218	003_create_special_offers.sql	2025-08-24 06:13:57.874145	started	\N	\N	0
425	001_backup_preparation.sql	2025-08-24 03:50:44.203494	completed	\N	\N	0
426	002_create_tour_categories.sql	2025-08-24 03:50:44.297327	started	\N	\N	0
427	002_create_tour_categories.sql	2025-08-24 03:50:44.297327	completed	\N	\N	8
428	003_create_special_offers.sql	2025-08-24 03:50:44.702086	started	\N	\N	0
429	003_create_special_offers.sql	2025-08-24 03:50:44.702086	completed	\N	\N	3
430	004_create_tour_statistics.sql	2025-08-24 03:50:45.136947	started	\N	\N	0
431	004_create_tour_statistics.sql	2025-08-24 03:50:45.136947	completed	\N	\N	0
432	005_create_featured_reviews.sql	2025-08-24 03:50:45.522726	started	\N	\N	0
433	005_create_featured_reviews.sql	2025-08-24 03:50:45.522726	completed	\N	\N	5
434	006_create_homepage_settings.sql	2025-08-24 03:50:45.991889	started	\N	\N	0
435	006_create_homepage_settings.sql	2025-08-24 03:50:45.991889	completed	\N	\N	10
436	007_enrich_tours_table.sql	2025-08-24 03:50:46.415639	started	\N	\N	0
437	007_enrich_tours_table.sql	2025-08-24 03:50:46.415639	completed	\N	\N	6
438	008_enrich_blog_posts_table.sql	2025-08-24 03:50:47.437242	started	\N	\N	0
439	008_enrich_blog_posts_table.sql	2025-08-24 03:50:47.437242	completed	\N	\N	0
440	009_enrich_destinations_table.sql	2025-08-24 03:50:48.425059	started	\N	\N	0
441	009_enrich_destinations_table.sql	2025-08-24 03:50:48.425059	completed	\N	\N	6
1219	003_create_special_offers.sql	2025-08-24 06:13:57.874145	completed	\N	\N	2
443	001_backup_preparation.sql	2025-08-24 03:51:11.551413	completed	\N	\N	0
444	002_create_tour_categories.sql	2025-08-24 03:51:11.611202	started	\N	\N	0
445	002_create_tour_categories.sql	2025-08-24 03:51:11.611202	completed	\N	\N	8
446	003_create_special_offers.sql	2025-08-24 03:51:11.929567	started	\N	\N	0
447	003_create_special_offers.sql	2025-08-24 03:51:11.929567	completed	\N	\N	3
1220	004_create_tour_statistics.sql	2025-08-24 06:13:58.187842	started	\N	\N	0
448	004_create_tour_statistics.sql	2025-08-24 03:51:12.351243	started	\N	\N	0
449	004_create_tour_statistics.sql	2025-08-24 03:51:12.351243	completed	\N	\N	0
450	005_create_featured_reviews.sql	2025-08-24 03:51:12.816689	started	\N	\N	0
451	005_create_featured_reviews.sql	2025-08-24 03:51:12.816689	completed	\N	\N	5
452	006_create_homepage_settings.sql	2025-08-24 03:51:13.338834	started	\N	\N	0
453	006_create_homepage_settings.sql	2025-08-24 03:51:13.338834	completed	\N	\N	10
454	007_enrich_tours_table.sql	2025-08-24 03:51:13.802601	started	\N	\N	0
455	007_enrich_tours_table.sql	2025-08-24 03:51:13.802601	completed	\N	\N	6
456	008_enrich_blog_posts_table.sql	2025-08-24 03:51:14.483921	started	\N	\N	0
457	008_enrich_blog_posts_table.sql	2025-08-24 03:51:14.483921	completed	\N	\N	0
458	009_enrich_destinations_table.sql	2025-08-24 03:51:15.196009	started	\N	\N	0
459	009_enrich_destinations_table.sql	2025-08-24 03:51:15.196009	completed	\N	\N	6
1221	004_create_tour_statistics.sql	2025-08-24 06:13:58.187842	completed	\N	\N	0
461	001_backup_preparation.sql	2025-08-24 03:51:39.338423	completed	\N	\N	0
462	002_create_tour_categories.sql	2025-08-24 03:51:39.415368	started	\N	\N	0
463	002_create_tour_categories.sql	2025-08-24 03:51:39.415368	completed	\N	\N	8
464	003_create_special_offers.sql	2025-08-24 03:51:39.693411	started	\N	\N	0
465	003_create_special_offers.sql	2025-08-24 03:51:39.693411	completed	\N	\N	3
466	004_create_tour_statistics.sql	2025-08-24 03:51:40.039157	started	\N	\N	0
467	004_create_tour_statistics.sql	2025-08-24 03:51:40.039157	completed	\N	\N	0
468	005_create_featured_reviews.sql	2025-08-24 03:51:40.416267	started	\N	\N	0
469	005_create_featured_reviews.sql	2025-08-24 03:51:40.416267	completed	\N	\N	5
470	006_create_homepage_settings.sql	2025-08-24 03:51:40.993387	started	\N	\N	0
471	006_create_homepage_settings.sql	2025-08-24 03:51:40.993387	completed	\N	\N	10
472	007_enrich_tours_table.sql	2025-08-24 03:51:41.584454	started	\N	\N	0
473	007_enrich_tours_table.sql	2025-08-24 03:51:41.584454	completed	\N	\N	6
474	008_enrich_blog_posts_table.sql	2025-08-24 03:51:42.354019	started	\N	\N	0
475	008_enrich_blog_posts_table.sql	2025-08-24 03:51:42.354019	completed	\N	\N	0
476	009_enrich_destinations_table.sql	2025-08-24 03:51:43.117495	started	\N	\N	0
477	009_enrich_destinations_table.sql	2025-08-24 03:51:43.117495	completed	\N	\N	6
1222	005_create_featured_reviews.sql	2025-08-24 06:13:58.594568	started	\N	\N	0
479	001_backup_preparation.sql	2025-08-24 03:52:51.856072	completed	\N	\N	0
480	002_create_tour_categories.sql	2025-08-24 03:52:51.905513	started	\N	\N	0
481	002_create_tour_categories.sql	2025-08-24 03:52:51.905513	completed	\N	\N	8
482	003_create_special_offers.sql	2025-08-24 03:52:52.195869	started	\N	\N	0
483	003_create_special_offers.sql	2025-08-24 03:52:52.195869	completed	\N	\N	3
484	004_create_tour_statistics.sql	2025-08-24 03:52:52.540266	started	\N	\N	0
485	004_create_tour_statistics.sql	2025-08-24 03:52:52.540266	completed	\N	\N	0
486	005_create_featured_reviews.sql	2025-08-24 03:52:52.898203	started	\N	\N	0
487	005_create_featured_reviews.sql	2025-08-24 03:52:52.898203	completed	\N	\N	5
488	006_create_homepage_settings.sql	2025-08-24 03:52:53.463449	started	\N	\N	0
489	006_create_homepage_settings.sql	2025-08-24 03:52:53.463449	completed	\N	\N	10
490	007_enrich_tours_table.sql	2025-08-24 03:52:54.053076	started	\N	\N	0
491	007_enrich_tours_table.sql	2025-08-24 03:52:54.053076	completed	\N	\N	6
492	008_enrich_blog_posts_table.sql	2025-08-24 03:52:54.914962	started	\N	\N	0
493	008_enrich_blog_posts_table.sql	2025-08-24 03:52:54.914962	completed	\N	\N	0
494	009_enrich_destinations_table.sql	2025-08-24 03:52:55.603684	started	\N	\N	0
495	009_enrich_destinations_table.sql	2025-08-24 03:52:55.603684	completed	\N	\N	6
1223	005_create_featured_reviews.sql	2025-08-24 06:13:58.594568	completed	\N	\N	5
497	001_backup_preparation.sql	2025-08-24 03:53:30.40628	completed	\N	\N	0
498	002_create_tour_categories.sql	2025-08-24 03:53:30.470318	started	\N	\N	0
499	002_create_tour_categories.sql	2025-08-24 03:53:30.470318	completed	\N	\N	8
500	003_create_special_offers.sql	2025-08-24 03:53:30.72197	started	\N	\N	0
501	003_create_special_offers.sql	2025-08-24 03:53:30.72197	completed	\N	\N	3
502	004_create_tour_statistics.sql	2025-08-24 03:53:31.057217	started	\N	\N	0
503	004_create_tour_statistics.sql	2025-08-24 03:53:31.057217	completed	\N	\N	0
504	005_create_featured_reviews.sql	2025-08-24 03:53:31.405305	started	\N	\N	0
505	005_create_featured_reviews.sql	2025-08-24 03:53:31.405305	completed	\N	\N	5
506	006_create_homepage_settings.sql	2025-08-24 03:53:31.889605	started	\N	\N	0
507	006_create_homepage_settings.sql	2025-08-24 03:53:31.889605	completed	\N	\N	10
508	007_enrich_tours_table.sql	2025-08-24 03:53:32.364638	started	\N	\N	0
509	007_enrich_tours_table.sql	2025-08-24 03:53:32.364638	completed	\N	\N	6
510	008_enrich_blog_posts_table.sql	2025-08-24 03:53:33.277608	started	\N	\N	0
511	008_enrich_blog_posts_table.sql	2025-08-24 03:53:33.277608	completed	\N	\N	0
512	009_enrich_destinations_table.sql	2025-08-24 03:53:34.187034	started	\N	\N	0
513	009_enrich_destinations_table.sql	2025-08-24 03:53:34.187034	completed	\N	\N	6
514	010_create_foreign_keys_constraints.sql	2025-08-24 03:53:35.283378	started	\N	\N	0
515	010_create_foreign_keys_constraints.sql	2025-08-24 03:53:35.283378	completed	\N	\N	0
516	001_backup_preparation.sql	2025-08-24 03:54:06.179441	completed	\N	\N	0
517	002_create_tour_categories.sql	2025-08-24 03:54:06.266573	started	\N	\N	0
518	002_create_tour_categories.sql	2025-08-24 03:54:06.266573	completed	\N	\N	8
519	003_create_special_offers.sql	2025-08-24 03:54:06.591403	started	\N	\N	0
520	003_create_special_offers.sql	2025-08-24 03:54:06.591403	completed	\N	\N	3
521	004_create_tour_statistics.sql	2025-08-24 03:54:07.047719	started	\N	\N	0
522	004_create_tour_statistics.sql	2025-08-24 03:54:07.047719	completed	\N	\N	0
523	005_create_featured_reviews.sql	2025-08-24 03:54:07.446298	started	\N	\N	0
524	005_create_featured_reviews.sql	2025-08-24 03:54:07.446298	completed	\N	\N	5
525	006_create_homepage_settings.sql	2025-08-24 03:54:07.889314	started	\N	\N	0
526	006_create_homepage_settings.sql	2025-08-24 03:54:07.889314	completed	\N	\N	10
527	007_enrich_tours_table.sql	2025-08-24 03:54:08.386616	started	\N	\N	0
528	007_enrich_tours_table.sql	2025-08-24 03:54:08.386616	completed	\N	\N	6
529	008_enrich_blog_posts_table.sql	2025-08-24 03:54:09.223251	started	\N	\N	0
530	008_enrich_blog_posts_table.sql	2025-08-24 03:54:09.223251	completed	\N	\N	0
531	009_enrich_destinations_table.sql	2025-08-24 03:54:10.102301	started	\N	\N	0
532	009_enrich_destinations_table.sql	2025-08-24 03:54:10.102301	completed	\N	\N	6
1224	006_create_homepage_settings.sql	2025-08-24 06:13:59.057861	started	\N	\N	0
534	001_backup_preparation.sql	2025-08-24 04:01:45.830856	completed	\N	\N	0
535	002_create_tour_categories.sql	2025-08-24 04:01:45.880579	started	\N	\N	0
536	002_create_tour_categories.sql	2025-08-24 04:01:45.880579	completed	\N	\N	8
537	003_create_special_offers.sql	2025-08-24 04:01:46.1501	started	\N	\N	0
538	003_create_special_offers.sql	2025-08-24 04:01:46.1501	completed	\N	\N	3
539	004_create_tour_statistics.sql	2025-08-24 04:01:46.495947	started	\N	\N	0
540	004_create_tour_statistics.sql	2025-08-24 04:01:46.495947	completed	\N	\N	0
541	005_create_featured_reviews.sql	2025-08-24 04:01:46.904741	started	\N	\N	0
542	005_create_featured_reviews.sql	2025-08-24 04:01:46.904741	completed	\N	\N	5
543	006_create_homepage_settings.sql	2025-08-24 04:01:47.679328	started	\N	\N	0
544	006_create_homepage_settings.sql	2025-08-24 04:01:47.679328	completed	\N	\N	10
545	007_enrich_tours_table.sql	2025-08-24 04:01:48.26152	started	\N	\N	0
546	007_enrich_tours_table.sql	2025-08-24 04:01:48.26152	completed	\N	\N	6
547	008_enrich_blog_posts_table.sql	2025-08-24 04:01:48.971169	started	\N	\N	0
548	008_enrich_blog_posts_table.sql	2025-08-24 04:01:48.971169	completed	\N	\N	0
549	009_enrich_destinations_table.sql	2025-08-24 04:01:49.678679	started	\N	\N	0
550	009_enrich_destinations_table.sql	2025-08-24 04:01:49.678679	completed	\N	\N	6
1225	006_create_homepage_settings.sql	2025-08-24 06:13:59.057861	completed	\N	\N	10
552	001_backup_preparation.sql	2025-08-24 04:02:17.031801	completed	\N	\N	0
553	002_create_tour_categories.sql	2025-08-24 04:02:17.080094	started	\N	\N	0
554	002_create_tour_categories.sql	2025-08-24 04:02:17.080094	completed	\N	\N	8
555	003_create_special_offers.sql	2025-08-24 04:02:17.38792	started	\N	\N	0
556	003_create_special_offers.sql	2025-08-24 04:02:17.38792	completed	\N	\N	3
557	004_create_tour_statistics.sql	2025-08-24 04:02:17.809454	started	\N	\N	0
558	004_create_tour_statistics.sql	2025-08-24 04:02:17.809454	completed	\N	\N	0
559	005_create_featured_reviews.sql	2025-08-24 04:02:18.299116	started	\N	\N	0
560	005_create_featured_reviews.sql	2025-08-24 04:02:18.299116	completed	\N	\N	5
561	006_create_homepage_settings.sql	2025-08-24 04:02:18.873178	started	\N	\N	0
562	006_create_homepage_settings.sql	2025-08-24 04:02:18.873178	completed	\N	\N	10
563	007_enrich_tours_table.sql	2025-08-24 04:02:19.384478	started	\N	\N	0
564	007_enrich_tours_table.sql	2025-08-24 04:02:19.384478	completed	\N	\N	6
565	008_enrich_blog_posts_table.sql	2025-08-24 04:02:20.097313	started	\N	\N	0
566	008_enrich_blog_posts_table.sql	2025-08-24 04:02:20.097313	completed	\N	\N	0
567	009_enrich_destinations_table.sql	2025-08-24 04:02:20.84513	started	\N	\N	0
568	009_enrich_destinations_table.sql	2025-08-24 04:02:20.84513	completed	\N	\N	6
2682	001_backup_preparation.sql	2025-08-24 07:58:36.476452	completed	\N	\N	0
570	001_backup_preparation.sql	2025-08-24 04:02:52.198192	completed	\N	\N	0
571	002_create_tour_categories.sql	2025-08-24 04:02:52.27061	started	\N	\N	0
572	002_create_tour_categories.sql	2025-08-24 04:02:52.27061	completed	\N	\N	8
573	003_create_special_offers.sql	2025-08-24 04:02:52.545259	started	\N	\N	0
574	003_create_special_offers.sql	2025-08-24 04:02:52.545259	completed	\N	\N	3
575	004_create_tour_statistics.sql	2025-08-24 04:02:52.878577	started	\N	\N	0
576	004_create_tour_statistics.sql	2025-08-24 04:02:52.878577	completed	\N	\N	0
577	005_create_featured_reviews.sql	2025-08-24 04:02:53.224394	started	\N	\N	0
578	005_create_featured_reviews.sql	2025-08-24 04:02:53.224394	completed	\N	\N	5
579	006_create_homepage_settings.sql	2025-08-24 04:02:53.677801	started	\N	\N	0
580	006_create_homepage_settings.sql	2025-08-24 04:02:53.677801	completed	\N	\N	10
581	007_enrich_tours_table.sql	2025-08-24 04:02:54.118889	started	\N	\N	0
582	007_enrich_tours_table.sql	2025-08-24 04:02:54.118889	completed	\N	\N	6
583	008_enrich_blog_posts_table.sql	2025-08-24 04:02:54.814633	started	\N	\N	0
584	008_enrich_blog_posts_table.sql	2025-08-24 04:02:54.814633	completed	\N	\N	0
585	009_enrich_destinations_table.sql	2025-08-24 04:02:55.682165	started	\N	\N	0
586	009_enrich_destinations_table.sql	2025-08-24 04:02:55.682165	completed	\N	\N	6
587	010_create_foreign_keys_constraints.sql	2025-08-24 04:02:57.076078	started	\N	\N	0
588	010_create_foreign_keys_constraints.sql	2025-08-24 04:02:57.076078	completed	\N	\N	0
589	001_backup_preparation.sql	2025-08-24 04:03:17.021899	completed	\N	\N	0
590	002_create_tour_categories.sql	2025-08-24 04:03:17.074452	started	\N	\N	0
591	002_create_tour_categories.sql	2025-08-24 04:03:17.074452	completed	\N	\N	8
592	003_create_special_offers.sql	2025-08-24 04:03:17.501744	started	\N	\N	0
593	003_create_special_offers.sql	2025-08-24 04:03:17.501744	completed	\N	\N	3
594	004_create_tour_statistics.sql	2025-08-24 04:03:17.989026	started	\N	\N	0
595	004_create_tour_statistics.sql	2025-08-24 04:03:17.989026	completed	\N	\N	0
596	005_create_featured_reviews.sql	2025-08-24 04:03:18.560007	started	\N	\N	0
597	005_create_featured_reviews.sql	2025-08-24 04:03:18.560007	completed	\N	\N	5
598	006_create_homepage_settings.sql	2025-08-24 04:03:19.129682	started	\N	\N	0
599	006_create_homepage_settings.sql	2025-08-24 04:03:19.129682	completed	\N	\N	10
600	007_enrich_tours_table.sql	2025-08-24 04:03:19.571006	started	\N	\N	0
601	007_enrich_tours_table.sql	2025-08-24 04:03:19.571006	completed	\N	\N	6
602	008_enrich_blog_posts_table.sql	2025-08-24 04:03:20.293404	started	\N	\N	0
603	008_enrich_blog_posts_table.sql	2025-08-24 04:03:20.293404	completed	\N	\N	0
604	009_enrich_destinations_table.sql	2025-08-24 04:03:21.159803	started	\N	\N	0
605	009_enrich_destinations_table.sql	2025-08-24 04:03:21.159803	completed	\N	\N	6
606	010_create_foreign_keys_constraints.sql	2025-08-24 04:03:22.428099	started	\N	\N	0
607	010_create_foreign_keys_constraints.sql	2025-08-24 04:03:22.428099	completed	\N	\N	0
1278	011_create_performance_indexes.sql	2025-08-24 06:16:00.898637	started	\N	\N	0
609	001_backup_preparation.sql	2025-08-24 04:05:01.868779	completed	\N	\N	0
610	002_create_tour_categories.sql	2025-08-24 04:05:01.953123	started	\N	\N	0
611	002_create_tour_categories.sql	2025-08-24 04:05:01.953123	completed	\N	\N	8
612	003_create_special_offers.sql	2025-08-24 04:05:02.268409	started	\N	\N	0
613	003_create_special_offers.sql	2025-08-24 04:05:02.268409	completed	\N	\N	3
614	004_create_tour_statistics.sql	2025-08-24 04:05:02.737332	started	\N	\N	0
615	004_create_tour_statistics.sql	2025-08-24 04:05:02.737332	completed	\N	\N	0
616	005_create_featured_reviews.sql	2025-08-24 04:05:03.215496	started	\N	\N	0
617	005_create_featured_reviews.sql	2025-08-24 04:05:03.215496	completed	\N	\N	5
618	006_create_homepage_settings.sql	2025-08-24 04:05:03.685899	started	\N	\N	0
619	006_create_homepage_settings.sql	2025-08-24 04:05:03.685899	completed	\N	\N	10
620	007_enrich_tours_table.sql	2025-08-24 04:05:04.121829	started	\N	\N	0
621	007_enrich_tours_table.sql	2025-08-24 04:05:04.121829	completed	\N	\N	6
622	008_enrich_blog_posts_table.sql	2025-08-24 04:05:04.8403	started	\N	\N	0
623	008_enrich_blog_posts_table.sql	2025-08-24 04:05:04.8403	completed	\N	\N	0
624	009_enrich_destinations_table.sql	2025-08-24 04:05:05.494202	started	\N	\N	0
625	009_enrich_destinations_table.sql	2025-08-24 04:05:05.494202	completed	\N	\N	6
626	010_create_foreign_keys_constraints.sql	2025-08-24 04:05:06.865971	started	\N	\N	0
627	010_create_foreign_keys_constraints.sql	2025-08-24 04:05:06.865971	completed	\N	\N	0
1227	001_backup_preparation.sql	2025-08-24 06:14:32.521348	completed	\N	\N	0
629	001_backup_preparation.sql	2025-08-24 04:05:50.74147	completed	\N	\N	0
630	002_create_tour_categories.sql	2025-08-24 04:05:50.793976	started	\N	\N	0
631	002_create_tour_categories.sql	2025-08-24 04:05:50.793976	completed	\N	\N	8
632	003_create_special_offers.sql	2025-08-24 04:05:51.035789	started	\N	\N	0
633	003_create_special_offers.sql	2025-08-24 04:05:51.035789	completed	\N	\N	3
634	004_create_tour_statistics.sql	2025-08-24 04:05:51.39427	started	\N	\N	0
635	004_create_tour_statistics.sql	2025-08-24 04:05:51.39427	completed	\N	\N	0
636	005_create_featured_reviews.sql	2025-08-24 04:05:51.745861	started	\N	\N	0
637	005_create_featured_reviews.sql	2025-08-24 04:05:51.745861	completed	\N	\N	5
638	006_create_homepage_settings.sql	2025-08-24 04:05:52.230676	started	\N	\N	0
639	006_create_homepage_settings.sql	2025-08-24 04:05:52.230676	completed	\N	\N	10
640	007_enrich_tours_table.sql	2025-08-24 04:05:52.746041	started	\N	\N	0
641	007_enrich_tours_table.sql	2025-08-24 04:05:52.746041	completed	\N	\N	6
642	008_enrich_blog_posts_table.sql	2025-08-24 04:05:53.784081	started	\N	\N	0
643	008_enrich_blog_posts_table.sql	2025-08-24 04:05:53.784081	completed	\N	\N	0
644	009_enrich_destinations_table.sql	2025-08-24 04:05:54.523537	started	\N	\N	0
645	009_enrich_destinations_table.sql	2025-08-24 04:05:54.523537	completed	\N	\N	6
646	010_create_foreign_keys_constraints.sql	2025-08-24 04:05:55.633128	started	\N	\N	0
647	010_create_foreign_keys_constraints.sql	2025-08-24 04:05:55.633128	completed	\N	\N	0
1228	002_create_tour_categories.sql	2025-08-24 06:14:32.569431	started	\N	\N	0
649	001_backup_preparation.sql	2025-08-24 04:06:26.635282	completed	\N	\N	0
650	002_create_tour_categories.sql	2025-08-24 04:06:26.703278	started	\N	\N	0
651	002_create_tour_categories.sql	2025-08-24 04:06:26.703278	completed	\N	\N	8
652	003_create_special_offers.sql	2025-08-24 04:06:27.009773	started	\N	\N	0
653	003_create_special_offers.sql	2025-08-24 04:06:27.009773	completed	\N	\N	3
654	004_create_tour_statistics.sql	2025-08-24 04:06:27.462971	started	\N	\N	0
655	004_create_tour_statistics.sql	2025-08-24 04:06:27.462971	completed	\N	\N	0
656	005_create_featured_reviews.sql	2025-08-24 04:06:27.909946	started	\N	\N	0
657	005_create_featured_reviews.sql	2025-08-24 04:06:27.909946	completed	\N	\N	5
658	006_create_homepage_settings.sql	2025-08-24 04:06:28.464855	started	\N	\N	0
659	006_create_homepage_settings.sql	2025-08-24 04:06:28.464855	completed	\N	\N	10
660	007_enrich_tours_table.sql	2025-08-24 04:06:28.900835	started	\N	\N	0
661	007_enrich_tours_table.sql	2025-08-24 04:06:28.900835	completed	\N	\N	6
662	008_enrich_blog_posts_table.sql	2025-08-24 04:06:29.591448	started	\N	\N	0
663	008_enrich_blog_posts_table.sql	2025-08-24 04:06:29.591448	completed	\N	\N	0
664	009_enrich_destinations_table.sql	2025-08-24 04:06:30.33546	started	\N	\N	0
665	009_enrich_destinations_table.sql	2025-08-24 04:06:30.33546	completed	\N	\N	6
666	010_create_foreign_keys_constraints.sql	2025-08-24 04:06:31.731174	started	\N	\N	0
667	010_create_foreign_keys_constraints.sql	2025-08-24 04:06:31.731174	completed	\N	\N	0
1229	002_create_tour_categories.sql	2025-08-24 06:14:32.569431	completed	\N	\N	8
669	001_backup_preparation.sql	2025-08-24 04:07:03.489616	completed	\N	\N	0
670	002_create_tour_categories.sql	2025-08-24 04:07:03.534172	started	\N	\N	0
671	002_create_tour_categories.sql	2025-08-24 04:07:03.534172	completed	\N	\N	8
672	003_create_special_offers.sql	2025-08-24 04:07:03.831463	started	\N	\N	0
673	003_create_special_offers.sql	2025-08-24 04:07:03.831463	completed	\N	\N	3
674	004_create_tour_statistics.sql	2025-08-24 04:07:04.289062	started	\N	\N	0
675	004_create_tour_statistics.sql	2025-08-24 04:07:04.289062	completed	\N	\N	0
676	005_create_featured_reviews.sql	2025-08-24 04:07:04.778466	started	\N	\N	0
677	005_create_featured_reviews.sql	2025-08-24 04:07:04.778466	completed	\N	\N	5
678	006_create_homepage_settings.sql	2025-08-24 04:07:05.454235	started	\N	\N	0
679	006_create_homepage_settings.sql	2025-08-24 04:07:05.454235	completed	\N	\N	10
680	007_enrich_tours_table.sql	2025-08-24 04:07:06.048979	started	\N	\N	0
681	007_enrich_tours_table.sql	2025-08-24 04:07:06.048979	completed	\N	\N	6
682	008_enrich_blog_posts_table.sql	2025-08-24 04:07:06.707281	started	\N	\N	0
683	008_enrich_blog_posts_table.sql	2025-08-24 04:07:06.707281	completed	\N	\N	0
684	009_enrich_destinations_table.sql	2025-08-24 04:07:07.440427	started	\N	\N	0
685	009_enrich_destinations_table.sql	2025-08-24 04:07:07.440427	completed	\N	\N	6
686	010_create_foreign_keys_constraints.sql	2025-08-24 04:07:08.617799	started	\N	\N	0
687	010_create_foreign_keys_constraints.sql	2025-08-24 04:07:08.617799	completed	\N	\N	0
1230	003_create_special_offers.sql	2025-08-24 06:14:32.844535	started	\N	\N	0
689	001_backup_preparation.sql	2025-08-24 04:08:37.363721	completed	\N	\N	0
690	002_create_tour_categories.sql	2025-08-24 04:08:37.441134	started	\N	\N	0
691	002_create_tour_categories.sql	2025-08-24 04:08:37.441134	completed	\N	\N	8
692	003_create_special_offers.sql	2025-08-24 04:08:37.8675	started	\N	\N	0
693	003_create_special_offers.sql	2025-08-24 04:08:37.8675	completed	\N	\N	3
694	004_create_tour_statistics.sql	2025-08-24 04:08:38.340127	started	\N	\N	0
695	004_create_tour_statistics.sql	2025-08-24 04:08:38.340127	completed	\N	\N	0
696	005_create_featured_reviews.sql	2025-08-24 04:08:38.725316	started	\N	\N	0
697	005_create_featured_reviews.sql	2025-08-24 04:08:38.725316	completed	\N	\N	5
698	006_create_homepage_settings.sql	2025-08-24 04:08:39.172689	started	\N	\N	0
699	006_create_homepage_settings.sql	2025-08-24 04:08:39.172689	completed	\N	\N	10
700	007_enrich_tours_table.sql	2025-08-24 04:08:39.614393	started	\N	\N	0
701	007_enrich_tours_table.sql	2025-08-24 04:08:39.614393	completed	\N	\N	6
702	008_enrich_blog_posts_table.sql	2025-08-24 04:08:40.307239	started	\N	\N	0
703	008_enrich_blog_posts_table.sql	2025-08-24 04:08:40.307239	completed	\N	\N	0
704	009_enrich_destinations_table.sql	2025-08-24 04:08:41.211744	started	\N	\N	0
705	009_enrich_destinations_table.sql	2025-08-24 04:08:41.211744	completed	\N	\N	6
706	010_create_foreign_keys_constraints.sql	2025-08-24 04:08:42.503311	started	\N	\N	0
707	010_create_foreign_keys_constraints.sql	2025-08-24 04:08:42.503311	completed	\N	\N	0
1231	003_create_special_offers.sql	2025-08-24 06:14:32.844535	completed	\N	\N	2
709	001_backup_preparation.sql	2025-08-24 04:09:23.484282	completed	\N	\N	0
710	002_create_tour_categories.sql	2025-08-24 04:09:23.533004	started	\N	\N	0
711	002_create_tour_categories.sql	2025-08-24 04:09:23.533004	completed	\N	\N	8
712	003_create_special_offers.sql	2025-08-24 04:09:23.906385	started	\N	\N	0
713	003_create_special_offers.sql	2025-08-24 04:09:23.906385	completed	\N	\N	3
714	004_create_tour_statistics.sql	2025-08-24 04:09:24.387166	started	\N	\N	0
715	004_create_tour_statistics.sql	2025-08-24 04:09:24.387166	completed	\N	\N	0
716	005_create_featured_reviews.sql	2025-08-24 04:09:24.905207	started	\N	\N	0
717	005_create_featured_reviews.sql	2025-08-24 04:09:24.905207	completed	\N	\N	5
718	006_create_homepage_settings.sql	2025-08-24 04:09:25.423867	started	\N	\N	0
719	006_create_homepage_settings.sql	2025-08-24 04:09:25.423867	completed	\N	\N	10
720	007_enrich_tours_table.sql	2025-08-24 04:09:25.87775	started	\N	\N	0
721	007_enrich_tours_table.sql	2025-08-24 04:09:25.87775	completed	\N	\N	6
722	008_enrich_blog_posts_table.sql	2025-08-24 04:09:26.625838	started	\N	\N	0
723	008_enrich_blog_posts_table.sql	2025-08-24 04:09:26.625838	completed	\N	\N	0
724	009_enrich_destinations_table.sql	2025-08-24 04:09:27.505181	started	\N	\N	0
725	009_enrich_destinations_table.sql	2025-08-24 04:09:27.505181	completed	\N	\N	6
726	010_create_foreign_keys_constraints.sql	2025-08-24 04:09:28.748286	started	\N	\N	0
727	010_create_foreign_keys_constraints.sql	2025-08-24 04:09:28.748286	completed	\N	\N	0
1232	004_create_tour_statistics.sql	2025-08-24 06:14:33.225589	started	\N	\N	0
729	001_backup_preparation.sql	2025-08-24 04:10:07.179359	completed	\N	\N	0
730	002_create_tour_categories.sql	2025-08-24 04:10:07.243774	started	\N	\N	0
731	002_create_tour_categories.sql	2025-08-24 04:10:07.243774	completed	\N	\N	8
732	003_create_special_offers.sql	2025-08-24 04:10:07.563683	started	\N	\N	0
733	003_create_special_offers.sql	2025-08-24 04:10:07.563683	completed	\N	\N	3
734	004_create_tour_statistics.sql	2025-08-24 04:10:08.073579	started	\N	\N	0
735	004_create_tour_statistics.sql	2025-08-24 04:10:08.073579	completed	\N	\N	0
736	005_create_featured_reviews.sql	2025-08-24 04:10:08.455148	started	\N	\N	0
737	005_create_featured_reviews.sql	2025-08-24 04:10:08.455148	completed	\N	\N	5
738	006_create_homepage_settings.sql	2025-08-24 04:10:08.928477	started	\N	\N	0
739	006_create_homepage_settings.sql	2025-08-24 04:10:08.928477	completed	\N	\N	10
740	007_enrich_tours_table.sql	2025-08-24 04:10:09.429498	started	\N	\N	0
741	007_enrich_tours_table.sql	2025-08-24 04:10:09.429498	completed	\N	\N	6
742	008_enrich_blog_posts_table.sql	2025-08-24 04:10:10.375062	started	\N	\N	0
743	008_enrich_blog_posts_table.sql	2025-08-24 04:10:10.375062	completed	\N	\N	0
744	009_enrich_destinations_table.sql	2025-08-24 04:10:11.211901	started	\N	\N	0
745	009_enrich_destinations_table.sql	2025-08-24 04:10:11.211901	completed	\N	\N	6
746	010_create_foreign_keys_constraints.sql	2025-08-24 04:10:12.304034	started	\N	\N	0
747	010_create_foreign_keys_constraints.sql	2025-08-24 04:10:12.304034	completed	\N	\N	0
1233	004_create_tour_statistics.sql	2025-08-24 06:14:33.225589	completed	\N	\N	0
749	001_backup_preparation.sql	2025-08-24 04:11:01.003215	completed	\N	\N	0
750	002_create_tour_categories.sql	2025-08-24 04:11:01.07841	started	\N	\N	0
751	002_create_tour_categories.sql	2025-08-24 04:11:01.07841	completed	\N	\N	8
752	003_create_special_offers.sql	2025-08-24 04:11:01.31713	started	\N	\N	0
753	003_create_special_offers.sql	2025-08-24 04:11:01.31713	completed	\N	\N	3
754	004_create_tour_statistics.sql	2025-08-24 04:11:01.657623	started	\N	\N	0
755	004_create_tour_statistics.sql	2025-08-24 04:11:01.657623	completed	\N	\N	0
756	005_create_featured_reviews.sql	2025-08-24 04:11:02.000465	started	\N	\N	0
757	005_create_featured_reviews.sql	2025-08-24 04:11:02.000465	completed	\N	\N	5
758	006_create_homepage_settings.sql	2025-08-24 04:11:02.564841	started	\N	\N	0
759	006_create_homepage_settings.sql	2025-08-24 04:11:02.564841	completed	\N	\N	10
760	007_enrich_tours_table.sql	2025-08-24 04:11:03.423752	started	\N	\N	0
761	007_enrich_tours_table.sql	2025-08-24 04:11:03.423752	completed	\N	\N	6
762	008_enrich_blog_posts_table.sql	2025-08-24 04:11:04.241705	started	\N	\N	0
763	008_enrich_blog_posts_table.sql	2025-08-24 04:11:04.241705	completed	\N	\N	0
764	009_enrich_destinations_table.sql	2025-08-24 04:11:04.948089	started	\N	\N	0
765	009_enrich_destinations_table.sql	2025-08-24 04:11:04.948089	completed	\N	\N	6
766	010_create_foreign_keys_constraints.sql	2025-08-24 04:11:06.032278	started	\N	\N	0
767	010_create_foreign_keys_constraints.sql	2025-08-24 04:11:06.032278	completed	\N	\N	0
1234	005_create_featured_reviews.sql	2025-08-24 06:14:33.628265	started	\N	\N	0
769	001_backup_preparation.sql	2025-08-24 04:11:29.707342	completed	\N	\N	0
770	002_create_tour_categories.sql	2025-08-24 04:11:29.762555	started	\N	\N	0
771	002_create_tour_categories.sql	2025-08-24 04:11:29.762555	completed	\N	\N	8
772	003_create_special_offers.sql	2025-08-24 04:11:30.073677	started	\N	\N	0
773	003_create_special_offers.sql	2025-08-24 04:11:30.073677	completed	\N	\N	3
774	004_create_tour_statistics.sql	2025-08-24 04:11:30.532054	started	\N	\N	0
775	004_create_tour_statistics.sql	2025-08-24 04:11:30.532054	completed	\N	\N	0
776	005_create_featured_reviews.sql	2025-08-24 04:11:30.978418	started	\N	\N	0
777	005_create_featured_reviews.sql	2025-08-24 04:11:30.978418	completed	\N	\N	5
778	006_create_homepage_settings.sql	2025-08-24 04:11:31.542673	started	\N	\N	0
779	006_create_homepage_settings.sql	2025-08-24 04:11:31.542673	completed	\N	\N	10
780	007_enrich_tours_table.sql	2025-08-24 04:11:32.094242	started	\N	\N	0
781	007_enrich_tours_table.sql	2025-08-24 04:11:32.094242	completed	\N	\N	6
782	008_enrich_blog_posts_table.sql	2025-08-24 04:11:32.854265	started	\N	\N	0
783	008_enrich_blog_posts_table.sql	2025-08-24 04:11:32.854265	completed	\N	\N	0
784	009_enrich_destinations_table.sql	2025-08-24 04:11:33.768244	started	\N	\N	0
785	009_enrich_destinations_table.sql	2025-08-24 04:11:33.768244	completed	\N	\N	6
786	010_create_foreign_keys_constraints.sql	2025-08-24 04:11:35.006849	started	\N	\N	0
787	010_create_foreign_keys_constraints.sql	2025-08-24 04:11:35.006849	completed	\N	\N	0
1235	005_create_featured_reviews.sql	2025-08-24 06:14:33.628265	completed	\N	\N	5
789	001_backup_preparation.sql	2025-08-24 04:12:06.367486	completed	\N	\N	0
790	002_create_tour_categories.sql	2025-08-24 04:12:06.432012	started	\N	\N	0
791	002_create_tour_categories.sql	2025-08-24 04:12:06.432012	completed	\N	\N	8
792	003_create_special_offers.sql	2025-08-24 04:12:06.849206	started	\N	\N	0
793	003_create_special_offers.sql	2025-08-24 04:12:06.849206	completed	\N	\N	3
794	004_create_tour_statistics.sql	2025-08-24 04:12:07.45986	started	\N	\N	0
795	004_create_tour_statistics.sql	2025-08-24 04:12:07.45986	completed	\N	\N	0
796	005_create_featured_reviews.sql	2025-08-24 04:12:07.918197	started	\N	\N	0
797	005_create_featured_reviews.sql	2025-08-24 04:12:07.918197	completed	\N	\N	5
798	006_create_homepage_settings.sql	2025-08-24 04:12:08.448949	started	\N	\N	0
799	006_create_homepage_settings.sql	2025-08-24 04:12:08.448949	completed	\N	\N	10
800	007_enrich_tours_table.sql	2025-08-24 04:12:09.060806	started	\N	\N	0
801	007_enrich_tours_table.sql	2025-08-24 04:12:09.060806	completed	\N	\N	6
802	008_enrich_blog_posts_table.sql	2025-08-24 04:12:09.751285	started	\N	\N	0
803	008_enrich_blog_posts_table.sql	2025-08-24 04:12:09.751285	completed	\N	\N	0
804	009_enrich_destinations_table.sql	2025-08-24 04:12:10.649372	started	\N	\N	0
805	009_enrich_destinations_table.sql	2025-08-24 04:12:10.649372	completed	\N	\N	6
806	010_create_foreign_keys_constraints.sql	2025-08-24 04:12:11.943702	started	\N	\N	0
807	010_create_foreign_keys_constraints.sql	2025-08-24 04:12:11.943702	completed	\N	\N	0
1236	006_create_homepage_settings.sql	2025-08-24 06:14:34.213109	started	\N	\N	0
809	001_backup_preparation.sql	2025-08-24 04:12:34.205325	completed	\N	\N	0
810	002_create_tour_categories.sql	2025-08-24 04:12:34.275466	started	\N	\N	0
811	002_create_tour_categories.sql	2025-08-24 04:12:34.275466	completed	\N	\N	8
812	003_create_special_offers.sql	2025-08-24 04:12:34.810075	started	\N	\N	0
813	003_create_special_offers.sql	2025-08-24 04:12:34.810075	completed	\N	\N	3
814	004_create_tour_statistics.sql	2025-08-24 04:12:35.601831	started	\N	\N	0
815	004_create_tour_statistics.sql	2025-08-24 04:12:35.601831	completed	\N	\N	0
816	005_create_featured_reviews.sql	2025-08-24 04:12:36.226168	started	\N	\N	0
817	005_create_featured_reviews.sql	2025-08-24 04:12:36.226168	completed	\N	\N	5
818	006_create_homepage_settings.sql	2025-08-24 04:12:36.948129	started	\N	\N	0
819	006_create_homepage_settings.sql	2025-08-24 04:12:36.948129	completed	\N	\N	10
820	007_enrich_tours_table.sql	2025-08-24 04:12:37.693411	started	\N	\N	0
821	007_enrich_tours_table.sql	2025-08-24 04:12:37.693411	completed	\N	\N	6
822	008_enrich_blog_posts_table.sql	2025-08-24 04:12:38.83253	started	\N	\N	0
823	008_enrich_blog_posts_table.sql	2025-08-24 04:12:38.83253	completed	\N	\N	0
824	009_enrich_destinations_table.sql	2025-08-24 04:12:39.563143	started	\N	\N	0
825	009_enrich_destinations_table.sql	2025-08-24 04:12:39.563143	completed	\N	\N	6
826	010_create_foreign_keys_constraints.sql	2025-08-24 04:12:41.077252	started	\N	\N	0
827	010_create_foreign_keys_constraints.sql	2025-08-24 04:12:41.077252	completed	\N	\N	0
1237	006_create_homepage_settings.sql	2025-08-24 06:14:34.213109	completed	\N	\N	10
829	001_backup_preparation.sql	2025-08-24 04:13:11.19061	completed	\N	\N	0
830	002_create_tour_categories.sql	2025-08-24 04:13:11.233059	started	\N	\N	0
831	002_create_tour_categories.sql	2025-08-24 04:13:11.233059	completed	\N	\N	8
832	003_create_special_offers.sql	2025-08-24 04:13:11.479954	started	\N	\N	0
833	003_create_special_offers.sql	2025-08-24 04:13:11.479954	completed	\N	\N	3
834	004_create_tour_statistics.sql	2025-08-24 04:13:11.822426	started	\N	\N	0
835	004_create_tour_statistics.sql	2025-08-24 04:13:11.822426	completed	\N	\N	0
836	005_create_featured_reviews.sql	2025-08-24 04:13:12.228894	started	\N	\N	0
837	005_create_featured_reviews.sql	2025-08-24 04:13:12.228894	completed	\N	\N	5
838	006_create_homepage_settings.sql	2025-08-24 04:13:12.745675	started	\N	\N	0
839	006_create_homepage_settings.sql	2025-08-24 04:13:12.745675	completed	\N	\N	10
840	007_enrich_tours_table.sql	2025-08-24 04:13:13.334514	started	\N	\N	0
841	007_enrich_tours_table.sql	2025-08-24 04:13:13.334514	completed	\N	\N	6
842	008_enrich_blog_posts_table.sql	2025-08-24 04:13:14.242737	started	\N	\N	0
843	008_enrich_blog_posts_table.sql	2025-08-24 04:13:14.242737	completed	\N	\N	0
844	009_enrich_destinations_table.sql	2025-08-24 04:13:14.945912	started	\N	\N	0
845	009_enrich_destinations_table.sql	2025-08-24 04:13:14.945912	completed	\N	\N	6
846	010_create_foreign_keys_constraints.sql	2025-08-24 04:13:16.208495	started	\N	\N	0
847	010_create_foreign_keys_constraints.sql	2025-08-24 04:13:16.208495	completed	\N	\N	0
2683	002_create_tour_categories.sql	2025-08-24 07:58:36.53896	started	\N	\N	0
849	001_backup_preparation.sql	2025-08-24 04:13:38.005654	completed	\N	\N	0
850	002_create_tour_categories.sql	2025-08-24 04:13:38.05312	started	\N	\N	0
851	002_create_tour_categories.sql	2025-08-24 04:13:38.05312	completed	\N	\N	8
852	003_create_special_offers.sql	2025-08-24 04:13:38.348117	started	\N	\N	0
853	003_create_special_offers.sql	2025-08-24 04:13:38.348117	completed	\N	\N	3
854	004_create_tour_statistics.sql	2025-08-24 04:13:38.677767	started	\N	\N	0
855	004_create_tour_statistics.sql	2025-08-24 04:13:38.677767	completed	\N	\N	0
856	005_create_featured_reviews.sql	2025-08-24 04:13:39.034586	started	\N	\N	0
857	005_create_featured_reviews.sql	2025-08-24 04:13:39.034586	completed	\N	\N	5
858	006_create_homepage_settings.sql	2025-08-24 04:13:39.487922	started	\N	\N	0
859	006_create_homepage_settings.sql	2025-08-24 04:13:39.487922	completed	\N	\N	10
860	007_enrich_tours_table.sql	2025-08-24 04:13:39.980926	started	\N	\N	0
861	007_enrich_tours_table.sql	2025-08-24 04:13:39.980926	completed	\N	\N	6
862	008_enrich_blog_posts_table.sql	2025-08-24 04:13:40.742302	started	\N	\N	0
863	008_enrich_blog_posts_table.sql	2025-08-24 04:13:40.742302	completed	\N	\N	0
864	009_enrich_destinations_table.sql	2025-08-24 04:13:41.707051	started	\N	\N	0
865	009_enrich_destinations_table.sql	2025-08-24 04:13:41.707051	completed	\N	\N	6
866	010_create_foreign_keys_constraints.sql	2025-08-24 04:13:42.848542	started	\N	\N	0
867	010_create_foreign_keys_constraints.sql	2025-08-24 04:13:42.848542	completed	\N	\N	0
1279	011_create_performance_indexes.sql	2025-08-24 06:16:00.898637	completed	\N	\N	0
869	001_backup_preparation.sql	2025-08-24 04:14:08.247027	completed	\N	\N	0
870	002_create_tour_categories.sql	2025-08-24 04:14:08.299327	started	\N	\N	0
871	002_create_tour_categories.sql	2025-08-24 04:14:08.299327	completed	\N	\N	8
872	003_create_special_offers.sql	2025-08-24 04:14:08.550416	started	\N	\N	0
873	003_create_special_offers.sql	2025-08-24 04:14:08.550416	completed	\N	\N	3
874	004_create_tour_statistics.sql	2025-08-24 04:14:08.905371	started	\N	\N	0
875	004_create_tour_statistics.sql	2025-08-24 04:14:08.905371	completed	\N	\N	0
876	005_create_featured_reviews.sql	2025-08-24 04:14:09.258586	started	\N	\N	0
877	005_create_featured_reviews.sql	2025-08-24 04:14:09.258586	completed	\N	\N	5
878	006_create_homepage_settings.sql	2025-08-24 04:14:09.718729	started	\N	\N	0
879	006_create_homepage_settings.sql	2025-08-24 04:14:09.718729	completed	\N	\N	10
880	007_enrich_tours_table.sql	2025-08-24 04:14:10.160615	started	\N	\N	0
881	007_enrich_tours_table.sql	2025-08-24 04:14:10.160615	completed	\N	\N	6
882	008_enrich_blog_posts_table.sql	2025-08-24 04:14:10.966121	started	\N	\N	0
883	008_enrich_blog_posts_table.sql	2025-08-24 04:14:10.966121	completed	\N	\N	0
884	009_enrich_destinations_table.sql	2025-08-24 04:14:11.770323	started	\N	\N	0
885	009_enrich_destinations_table.sql	2025-08-24 04:14:11.770323	completed	\N	\N	6
886	010_create_foreign_keys_constraints.sql	2025-08-24 04:14:12.975745	started	\N	\N	0
887	010_create_foreign_keys_constraints.sql	2025-08-24 04:14:12.975745	completed	\N	\N	0
2684	002_create_tour_categories.sql	2025-08-24 07:58:36.53896	completed	\N	\N	8
889	001_backup_preparation.sql	2025-08-24 04:14:50.672622	completed	\N	\N	0
890	002_create_tour_categories.sql	2025-08-24 04:14:50.717762	started	\N	\N	0
891	002_create_tour_categories.sql	2025-08-24 04:14:50.717762	completed	\N	\N	8
892	003_create_special_offers.sql	2025-08-24 04:14:50.996052	started	\N	\N	0
893	003_create_special_offers.sql	2025-08-24 04:14:50.996052	completed	\N	\N	3
894	004_create_tour_statistics.sql	2025-08-24 04:14:51.402493	started	\N	\N	0
895	004_create_tour_statistics.sql	2025-08-24 04:14:51.402493	completed	\N	\N	0
896	005_create_featured_reviews.sql	2025-08-24 04:14:51.731317	started	\N	\N	0
897	005_create_featured_reviews.sql	2025-08-24 04:14:51.731317	completed	\N	\N	5
898	006_create_homepage_settings.sql	2025-08-24 04:14:52.198207	started	\N	\N	0
899	006_create_homepage_settings.sql	2025-08-24 04:14:52.198207	completed	\N	\N	10
900	007_enrich_tours_table.sql	2025-08-24 04:14:52.651927	started	\N	\N	0
901	007_enrich_tours_table.sql	2025-08-24 04:14:52.651927	completed	\N	\N	6
902	008_enrich_blog_posts_table.sql	2025-08-24 04:14:53.490519	started	\N	\N	0
903	008_enrich_blog_posts_table.sql	2025-08-24 04:14:53.490519	completed	\N	\N	0
904	009_enrich_destinations_table.sql	2025-08-24 04:14:54.495184	started	\N	\N	0
905	009_enrich_destinations_table.sql	2025-08-24 04:14:54.495184	completed	\N	\N	6
906	010_create_foreign_keys_constraints.sql	2025-08-24 04:14:55.586116	started	\N	\N	0
907	010_create_foreign_keys_constraints.sql	2025-08-24 04:14:55.586116	completed	\N	\N	0
1239	001_backup_preparation.sql	2025-08-24 06:15:00.238128	completed	\N	\N	0
909	001_backup_preparation.sql	2025-08-24 04:15:16.570896	completed	\N	\N	0
910	002_create_tour_categories.sql	2025-08-24 04:15:16.627067	started	\N	\N	0
911	002_create_tour_categories.sql	2025-08-24 04:15:16.627067	completed	\N	\N	8
912	003_create_special_offers.sql	2025-08-24 04:15:16.953616	started	\N	\N	0
913	003_create_special_offers.sql	2025-08-24 04:15:16.953616	completed	\N	\N	3
914	004_create_tour_statistics.sql	2025-08-24 04:15:17.402655	started	\N	\N	0
915	004_create_tour_statistics.sql	2025-08-24 04:15:17.402655	completed	\N	\N	0
916	005_create_featured_reviews.sql	2025-08-24 04:15:17.847654	started	\N	\N	0
917	005_create_featured_reviews.sql	2025-08-24 04:15:17.847654	completed	\N	\N	5
918	006_create_homepage_settings.sql	2025-08-24 04:15:18.339915	started	\N	\N	0
919	006_create_homepage_settings.sql	2025-08-24 04:15:18.339915	completed	\N	\N	10
920	007_enrich_tours_table.sql	2025-08-24 04:15:18.808785	started	\N	\N	0
921	007_enrich_tours_table.sql	2025-08-24 04:15:18.808785	completed	\N	\N	6
922	008_enrich_blog_posts_table.sql	2025-08-24 04:15:19.740734	started	\N	\N	0
923	008_enrich_blog_posts_table.sql	2025-08-24 04:15:19.740734	completed	\N	\N	0
924	009_enrich_destinations_table.sql	2025-08-24 04:15:20.606198	started	\N	\N	0
925	009_enrich_destinations_table.sql	2025-08-24 04:15:20.606198	completed	\N	\N	6
926	010_create_foreign_keys_constraints.sql	2025-08-24 04:15:21.675729	started	\N	\N	0
927	010_create_foreign_keys_constraints.sql	2025-08-24 04:15:21.675729	completed	\N	\N	0
928	011_create_performance_indexes.sql	2025-08-24 04:15:22.766604	started	\N	\N	0
929	011_create_performance_indexes.sql	2025-08-24 04:15:22.766604	completed	\N	\N	0
1240	002_create_tour_categories.sql	2025-08-24 06:15:00.310684	started	\N	\N	0
931	001_backup_preparation.sql	2025-08-24 04:16:19.608573	completed	\N	\N	0
932	002_create_tour_categories.sql	2025-08-24 04:16:19.714346	started	\N	\N	0
933	002_create_tour_categories.sql	2025-08-24 04:16:19.714346	completed	\N	\N	8
934	003_create_special_offers.sql	2025-08-24 04:16:20.072047	started	\N	\N	0
935	003_create_special_offers.sql	2025-08-24 04:16:20.072047	completed	\N	\N	3
936	004_create_tour_statistics.sql	2025-08-24 04:16:20.530211	started	\N	\N	0
937	004_create_tour_statistics.sql	2025-08-24 04:16:20.530211	completed	\N	\N	0
938	005_create_featured_reviews.sql	2025-08-24 04:16:20.884404	started	\N	\N	0
939	005_create_featured_reviews.sql	2025-08-24 04:16:20.884404	completed	\N	\N	5
940	006_create_homepage_settings.sql	2025-08-24 04:16:21.423889	started	\N	\N	0
941	006_create_homepage_settings.sql	2025-08-24 04:16:21.423889	completed	\N	\N	10
942	007_enrich_tours_table.sql	2025-08-24 04:16:21.869224	started	\N	\N	0
943	007_enrich_tours_table.sql	2025-08-24 04:16:21.869224	completed	\N	\N	6
944	008_enrich_blog_posts_table.sql	2025-08-24 04:16:22.594343	started	\N	\N	0
945	008_enrich_blog_posts_table.sql	2025-08-24 04:16:22.594343	completed	\N	\N	0
946	009_enrich_destinations_table.sql	2025-08-24 04:16:23.510614	started	\N	\N	0
947	009_enrich_destinations_table.sql	2025-08-24 04:16:23.510614	completed	\N	\N	6
948	010_create_foreign_keys_constraints.sql	2025-08-24 04:16:24.787202	started	\N	\N	0
949	010_create_foreign_keys_constraints.sql	2025-08-24 04:16:24.787202	completed	\N	\N	0
950	011_create_performance_indexes.sql	2025-08-24 04:16:25.642498	started	\N	\N	0
951	011_create_performance_indexes.sql	2025-08-24 04:16:25.642498	completed	\N	\N	0
1241	002_create_tour_categories.sql	2025-08-24 06:15:00.310684	completed	\N	\N	8
953	001_backup_preparation.sql	2025-08-24 04:18:09.434528	completed	\N	\N	0
954	002_create_tour_categories.sql	2025-08-24 04:18:09.502618	started	\N	\N	0
955	002_create_tour_categories.sql	2025-08-24 04:18:09.502618	completed	\N	\N	8
956	003_create_special_offers.sql	2025-08-24 04:18:09.812784	started	\N	\N	0
957	003_create_special_offers.sql	2025-08-24 04:18:09.812784	completed	\N	\N	3
958	004_create_tour_statistics.sql	2025-08-24 04:18:10.372447	started	\N	\N	0
959	004_create_tour_statistics.sql	2025-08-24 04:18:10.372447	completed	\N	\N	0
960	005_create_featured_reviews.sql	2025-08-24 04:18:10.996582	started	\N	\N	0
961	005_create_featured_reviews.sql	2025-08-24 04:18:10.996582	completed	\N	\N	5
962	006_create_homepage_settings.sql	2025-08-24 04:18:11.573923	started	\N	\N	0
963	006_create_homepage_settings.sql	2025-08-24 04:18:11.573923	completed	\N	\N	10
964	007_enrich_tours_table.sql	2025-08-24 04:18:12.05774	started	\N	\N	0
965	007_enrich_tours_table.sql	2025-08-24 04:18:12.05774	completed	\N	\N	6
966	008_enrich_blog_posts_table.sql	2025-08-24 04:18:13.146693	started	\N	\N	0
967	008_enrich_blog_posts_table.sql	2025-08-24 04:18:13.146693	completed	\N	\N	0
968	009_enrich_destinations_table.sql	2025-08-24 04:18:14.10446	started	\N	\N	0
969	009_enrich_destinations_table.sql	2025-08-24 04:18:14.10446	completed	\N	\N	6
970	010_create_foreign_keys_constraints.sql	2025-08-24 04:18:15.152304	started	\N	\N	0
971	010_create_foreign_keys_constraints.sql	2025-08-24 04:18:15.152304	completed	\N	\N	0
972	011_create_performance_indexes.sql	2025-08-24 04:18:16.099328	started	\N	\N	0
973	011_create_performance_indexes.sql	2025-08-24 04:18:16.099328	completed	\N	\N	0
1242	003_create_special_offers.sql	2025-08-24 06:15:00.642196	started	\N	\N	0
975	001_backup_preparation.sql	2025-08-24 04:33:28.747201	completed	\N	\N	0
976	002_create_tour_categories.sql	2025-08-24 04:33:28.789699	started	\N	\N	0
977	002_create_tour_categories.sql	2025-08-24 04:33:28.789699	completed	\N	\N	8
978	003_create_special_offers.sql	2025-08-24 04:33:29.04081	started	\N	\N	0
979	003_create_special_offers.sql	2025-08-24 04:33:29.04081	completed	\N	\N	3
980	004_create_tour_statistics.sql	2025-08-24 04:33:29.391254	started	\N	\N	0
981	004_create_tour_statistics.sql	2025-08-24 04:33:29.391254	completed	\N	\N	0
982	005_create_featured_reviews.sql	2025-08-24 04:33:29.785201	started	\N	\N	0
983	005_create_featured_reviews.sql	2025-08-24 04:33:29.785201	completed	\N	\N	5
984	006_create_homepage_settings.sql	2025-08-24 04:33:30.318962	started	\N	\N	0
985	006_create_homepage_settings.sql	2025-08-24 04:33:30.318962	completed	\N	\N	10
986	007_enrich_tours_table.sql	2025-08-24 04:33:30.735312	started	\N	\N	0
987	007_enrich_tours_table.sql	2025-08-24 04:33:30.735312	completed	\N	\N	6
988	008_enrich_blog_posts_table.sql	2025-08-24 04:33:31.439589	started	\N	\N	0
989	008_enrich_blog_posts_table.sql	2025-08-24 04:33:31.439589	completed	\N	\N	0
990	009_enrich_destinations_table.sql	2025-08-24 04:33:32.244826	started	\N	\N	0
991	009_enrich_destinations_table.sql	2025-08-24 04:33:32.244826	completed	\N	\N	6
992	010_create_foreign_keys_constraints.sql	2025-08-24 04:33:33.786831	started	\N	\N	0
993	010_create_foreign_keys_constraints.sql	2025-08-24 04:33:33.786831	completed	\N	\N	0
994	011_create_performance_indexes.sql	2025-08-24 04:33:34.678704	started	\N	\N	0
995	011_create_performance_indexes.sql	2025-08-24 04:33:34.678704	completed	\N	\N	0
1243	003_create_special_offers.sql	2025-08-24 06:15:00.642196	completed	\N	\N	2
997	001_backup_preparation.sql	2025-08-24 04:34:58.850655	completed	\N	\N	0
998	002_create_tour_categories.sql	2025-08-24 04:34:58.912739	started	\N	\N	0
999	002_create_tour_categories.sql	2025-08-24 04:34:58.912739	completed	\N	\N	8
1000	003_create_special_offers.sql	2025-08-24 04:34:59.229457	started	\N	\N	0
1001	003_create_special_offers.sql	2025-08-24 04:34:59.229457	completed	\N	\N	3
1002	004_create_tour_statistics.sql	2025-08-24 04:34:59.644031	started	\N	\N	0
1003	004_create_tour_statistics.sql	2025-08-24 04:34:59.644031	completed	\N	\N	0
1004	005_create_featured_reviews.sql	2025-08-24 04:35:00.06263	started	\N	\N	0
1005	005_create_featured_reviews.sql	2025-08-24 04:35:00.06263	completed	\N	\N	5
1006	006_create_homepage_settings.sql	2025-08-24 04:35:00.580913	started	\N	\N	0
1007	006_create_homepage_settings.sql	2025-08-24 04:35:00.580913	completed	\N	\N	10
1008	007_enrich_tours_table.sql	2025-08-24 04:35:01.184002	started	\N	\N	0
1009	007_enrich_tours_table.sql	2025-08-24 04:35:01.184002	completed	\N	\N	6
1010	008_enrich_blog_posts_table.sql	2025-08-24 04:35:01.892103	started	\N	\N	0
1011	008_enrich_blog_posts_table.sql	2025-08-24 04:35:01.892103	completed	\N	\N	0
1012	009_enrich_destinations_table.sql	2025-08-24 04:35:02.582136	started	\N	\N	0
1013	009_enrich_destinations_table.sql	2025-08-24 04:35:02.582136	completed	\N	\N	6
1014	010_create_foreign_keys_constraints.sql	2025-08-24 04:35:04.111839	started	\N	\N	0
1015	010_create_foreign_keys_constraints.sql	2025-08-24 04:35:04.111839	completed	\N	\N	0
1016	011_create_performance_indexes.sql	2025-08-24 04:35:05.388379	started	\N	\N	0
1017	011_create_performance_indexes.sql	2025-08-24 04:35:05.388379	completed	\N	\N	0
1244	004_create_tour_statistics.sql	2025-08-24 06:15:00.940221	started	\N	\N	0
1019	001_backup_preparation.sql	2025-08-24 04:37:19.524359	completed	\N	\N	0
1020	002_create_tour_categories.sql	2025-08-24 04:37:19.574952	started	\N	\N	0
1021	002_create_tour_categories.sql	2025-08-24 04:37:19.574952	completed	\N	\N	8
1022	003_create_special_offers.sql	2025-08-24 04:37:19.863463	started	\N	\N	0
1023	003_create_special_offers.sql	2025-08-24 04:37:19.863463	completed	\N	\N	3
1024	004_create_tour_statistics.sql	2025-08-24 04:37:20.312505	started	\N	\N	0
1025	004_create_tour_statistics.sql	2025-08-24 04:37:20.312505	completed	\N	\N	0
1026	005_create_featured_reviews.sql	2025-08-24 04:37:20.861681	started	\N	\N	0
1027	005_create_featured_reviews.sql	2025-08-24 04:37:20.861681	completed	\N	\N	5
1028	006_create_homepage_settings.sql	2025-08-24 04:37:21.581417	started	\N	\N	0
1029	006_create_homepage_settings.sql	2025-08-24 04:37:21.581417	completed	\N	\N	10
1030	007_enrich_tours_table.sql	2025-08-24 04:37:21.99966	started	\N	\N	0
1031	007_enrich_tours_table.sql	2025-08-24 04:37:21.99966	completed	\N	\N	6
1032	008_enrich_blog_posts_table.sql	2025-08-24 04:37:22.713891	started	\N	\N	0
1033	008_enrich_blog_posts_table.sql	2025-08-24 04:37:22.713891	completed	\N	\N	0
1034	009_enrich_destinations_table.sql	2025-08-24 04:37:23.383694	started	\N	\N	0
1035	009_enrich_destinations_table.sql	2025-08-24 04:37:23.383694	completed	\N	\N	6
1036	010_create_foreign_keys_constraints.sql	2025-08-24 04:37:24.466557	started	\N	\N	0
1037	010_create_foreign_keys_constraints.sql	2025-08-24 04:37:24.466557	completed	\N	\N	0
1038	011_create_performance_indexes.sql	2025-08-24 04:37:25.684319	started	\N	\N	0
1039	011_create_performance_indexes.sql	2025-08-24 04:37:25.684319	completed	\N	\N	0
1245	004_create_tour_statistics.sql	2025-08-24 06:15:00.940221	completed	\N	\N	0
1041	001_backup_preparation.sql	2025-08-24 04:39:25.764949	completed	\N	\N	0
1042	002_create_tour_categories.sql	2025-08-24 04:39:25.812791	started	\N	\N	0
1043	002_create_tour_categories.sql	2025-08-24 04:39:25.812791	completed	\N	\N	8
1044	003_create_special_offers.sql	2025-08-24 04:39:26.088496	started	\N	\N	0
1045	003_create_special_offers.sql	2025-08-24 04:39:26.088496	completed	\N	\N	3
1046	004_create_tour_statistics.sql	2025-08-24 04:39:26.476876	started	\N	\N	0
1047	004_create_tour_statistics.sql	2025-08-24 04:39:26.476876	completed	\N	\N	0
1048	005_create_featured_reviews.sql	2025-08-24 04:39:26.861275	started	\N	\N	0
1049	005_create_featured_reviews.sql	2025-08-24 04:39:26.861275	completed	\N	\N	5
1050	006_create_homepage_settings.sql	2025-08-24 04:39:27.34288	started	\N	\N	0
1051	006_create_homepage_settings.sql	2025-08-24 04:39:27.34288	completed	\N	\N	10
1052	007_enrich_tours_table.sql	2025-08-24 04:39:27.869827	started	\N	\N	0
1053	007_enrich_tours_table.sql	2025-08-24 04:39:27.869827	completed	\N	\N	6
1054	008_enrich_blog_posts_table.sql	2025-08-24 04:39:28.631542	started	\N	\N	0
1055	008_enrich_blog_posts_table.sql	2025-08-24 04:39:28.631542	completed	\N	\N	0
1056	009_enrich_destinations_table.sql	2025-08-24 04:39:29.307538	started	\N	\N	0
1057	009_enrich_destinations_table.sql	2025-08-24 04:39:29.307538	completed	\N	\N	6
1058	010_create_foreign_keys_constraints.sql	2025-08-24 04:39:30.288672	started	\N	\N	0
1059	010_create_foreign_keys_constraints.sql	2025-08-24 04:39:30.288672	completed	\N	\N	0
1060	011_create_performance_indexes.sql	2025-08-24 04:39:31.21718	started	\N	\N	0
1061	011_create_performance_indexes.sql	2025-08-24 04:39:31.21718	completed	\N	\N	0
1246	005_create_featured_reviews.sql	2025-08-24 06:15:01.280945	started	\N	\N	0
1063	001_backup_preparation.sql	2025-08-24 04:50:26.695291	completed	\N	\N	0
1064	002_create_tour_categories.sql	2025-08-24 04:50:26.755206	started	\N	\N	0
1065	002_create_tour_categories.sql	2025-08-24 04:50:26.755206	completed	\N	\N	8
1066	003_create_special_offers.sql	2025-08-24 04:50:27.053105	started	\N	\N	0
1067	003_create_special_offers.sql	2025-08-24 04:50:27.053105	completed	\N	\N	3
1068	004_create_tour_statistics.sql	2025-08-24 04:50:27.436857	started	\N	\N	0
1069	004_create_tour_statistics.sql	2025-08-24 04:50:27.436857	completed	\N	\N	0
1070	005_create_featured_reviews.sql	2025-08-24 04:50:27.839081	started	\N	\N	0
1071	005_create_featured_reviews.sql	2025-08-24 04:50:27.839081	completed	\N	\N	5
1072	006_create_homepage_settings.sql	2025-08-24 04:50:28.289285	started	\N	\N	0
1073	006_create_homepage_settings.sql	2025-08-24 04:50:28.289285	completed	\N	\N	10
1074	007_enrich_tours_table.sql	2025-08-24 04:50:28.72385	started	\N	\N	0
1075	007_enrich_tours_table.sql	2025-08-24 04:50:28.72385	completed	\N	\N	6
1076	008_enrich_blog_posts_table.sql	2025-08-24 04:50:29.501331	started	\N	\N	0
1077	008_enrich_blog_posts_table.sql	2025-08-24 04:50:29.501331	completed	\N	\N	0
1078	009_enrich_destinations_table.sql	2025-08-24 04:50:30.213688	started	\N	\N	0
1079	009_enrich_destinations_table.sql	2025-08-24 04:50:30.213688	completed	\N	\N	6
1080	010_create_foreign_keys_constraints.sql	2025-08-24 04:50:31.533093	started	\N	\N	0
1081	010_create_foreign_keys_constraints.sql	2025-08-24 04:50:31.533093	completed	\N	\N	0
1082	011_create_performance_indexes.sql	2025-08-24 04:50:32.663632	started	\N	\N	0
1083	011_create_performance_indexes.sql	2025-08-24 04:50:32.663632	completed	\N	\N	0
1247	005_create_featured_reviews.sql	2025-08-24 06:15:01.280945	completed	\N	\N	5
1085	001_backup_preparation.sql	2025-08-24 04:51:40.878565	completed	\N	\N	0
1086	002_create_tour_categories.sql	2025-08-24 04:51:40.920418	started	\N	\N	0
1087	002_create_tour_categories.sql	2025-08-24 04:51:40.920418	completed	\N	\N	8
1088	003_create_special_offers.sql	2025-08-24 04:51:41.15727	started	\N	\N	0
1089	003_create_special_offers.sql	2025-08-24 04:51:41.15727	completed	\N	\N	3
1090	004_create_tour_statistics.sql	2025-08-24 04:51:41.497524	started	\N	\N	0
1091	004_create_tour_statistics.sql	2025-08-24 04:51:41.497524	completed	\N	\N	0
1092	005_create_featured_reviews.sql	2025-08-24 04:51:41.849797	started	\N	\N	0
1093	005_create_featured_reviews.sql	2025-08-24 04:51:41.849797	completed	\N	\N	5
1094	006_create_homepage_settings.sql	2025-08-24 04:51:42.485502	started	\N	\N	0
1095	006_create_homepage_settings.sql	2025-08-24 04:51:42.485502	completed	\N	\N	10
1096	007_enrich_tours_table.sql	2025-08-24 04:51:43.209858	started	\N	\N	0
1097	007_enrich_tours_table.sql	2025-08-24 04:51:43.209858	completed	\N	\N	6
1098	008_enrich_blog_posts_table.sql	2025-08-24 04:51:44.044123	started	\N	\N	0
1099	008_enrich_blog_posts_table.sql	2025-08-24 04:51:44.044123	completed	\N	\N	0
1100	009_enrich_destinations_table.sql	2025-08-24 04:51:44.682905	started	\N	\N	0
1101	009_enrich_destinations_table.sql	2025-08-24 04:51:44.682905	completed	\N	\N	6
1102	010_create_foreign_keys_constraints.sql	2025-08-24 04:51:45.748512	started	\N	\N	0
1103	010_create_foreign_keys_constraints.sql	2025-08-24 04:51:45.748512	completed	\N	\N	0
1104	011_create_performance_indexes.sql	2025-08-24 04:51:46.687069	started	\N	\N	0
1105	011_create_performance_indexes.sql	2025-08-24 04:51:46.687069	completed	\N	\N	0
1248	006_create_homepage_settings.sql	2025-08-24 06:15:01.714069	started	\N	\N	0
1107	001_backup_preparation.sql	2025-08-24 05:01:22.33637	completed	\N	\N	0
1108	002_create_tour_categories.sql	2025-08-24 05:01:22.389833	started	\N	\N	0
1109	002_create_tour_categories.sql	2025-08-24 05:01:22.389833	completed	\N	\N	8
1110	003_create_special_offers.sql	2025-08-24 05:01:22.648995	started	\N	\N	0
1111	003_create_special_offers.sql	2025-08-24 05:01:22.648995	completed	\N	\N	3
1112	004_create_tour_statistics.sql	2025-08-24 05:01:22.982188	started	\N	\N	0
1113	004_create_tour_statistics.sql	2025-08-24 05:01:22.982188	completed	\N	\N	0
1114	005_create_featured_reviews.sql	2025-08-24 05:01:23.326488	started	\N	\N	0
1115	005_create_featured_reviews.sql	2025-08-24 05:01:23.326488	completed	\N	\N	5
1116	006_create_homepage_settings.sql	2025-08-24 05:01:23.868057	started	\N	\N	0
1117	006_create_homepage_settings.sql	2025-08-24 05:01:23.868057	completed	\N	\N	10
1118	007_enrich_tours_table.sql	2025-08-24 05:01:24.295197	started	\N	\N	0
1119	007_enrich_tours_table.sql	2025-08-24 05:01:24.295197	completed	\N	\N	6
1120	008_enrich_blog_posts_table.sql	2025-08-24 05:01:25.072024	started	\N	\N	0
1121	008_enrich_blog_posts_table.sql	2025-08-24 05:01:25.072024	completed	\N	\N	0
1122	009_enrich_destinations_table.sql	2025-08-24 05:01:25.74514	started	\N	\N	0
1123	009_enrich_destinations_table.sql	2025-08-24 05:01:25.74514	completed	\N	\N	6
1124	010_create_foreign_keys_constraints.sql	2025-08-24 05:01:26.875367	started	\N	\N	0
1125	010_create_foreign_keys_constraints.sql	2025-08-24 05:01:26.875367	completed	\N	\N	0
1126	011_create_performance_indexes.sql	2025-08-24 05:01:27.949278	started	\N	\N	0
1127	011_create_performance_indexes.sql	2025-08-24 05:01:27.949278	completed	\N	\N	0
1249	006_create_homepage_settings.sql	2025-08-24 06:15:01.714069	completed	\N	\N	10
1129	001_backup_preparation.sql	2025-08-24 05:03:24.991743	completed	\N	\N	0
1130	002_create_tour_categories.sql	2025-08-24 05:03:25.07463	started	\N	\N	0
1131	002_create_tour_categories.sql	2025-08-24 05:03:25.07463	completed	\N	\N	8
1132	003_create_special_offers.sql	2025-08-24 05:03:25.551381	started	\N	\N	0
1133	003_create_special_offers.sql	2025-08-24 05:03:25.551381	completed	\N	\N	3
1134	004_create_tour_statistics.sql	2025-08-24 05:03:26.098436	started	\N	\N	0
1135	004_create_tour_statistics.sql	2025-08-24 05:03:26.098436	completed	\N	\N	0
1136	005_create_featured_reviews.sql	2025-08-24 05:03:26.620181	started	\N	\N	0
1137	005_create_featured_reviews.sql	2025-08-24 05:03:26.620181	completed	\N	\N	5
1138	006_create_homepage_settings.sql	2025-08-24 05:03:27.217013	started	\N	\N	0
1139	006_create_homepage_settings.sql	2025-08-24 05:03:27.217013	completed	\N	\N	10
1140	007_enrich_tours_table.sql	2025-08-24 05:03:27.690866	started	\N	\N	0
1141	007_enrich_tours_table.sql	2025-08-24 05:03:27.690866	completed	\N	\N	6
1142	008_enrich_blog_posts_table.sql	2025-08-24 05:03:28.516008	started	\N	\N	0
1143	008_enrich_blog_posts_table.sql	2025-08-24 05:03:28.516008	completed	\N	\N	0
1144	009_enrich_destinations_table.sql	2025-08-24 05:03:29.537136	started	\N	\N	0
1145	009_enrich_destinations_table.sql	2025-08-24 05:03:29.537136	completed	\N	\N	6
1146	010_create_foreign_keys_constraints.sql	2025-08-24 05:03:30.702918	started	\N	\N	0
1147	010_create_foreign_keys_constraints.sql	2025-08-24 05:03:30.702918	completed	\N	\N	0
1148	011_create_performance_indexes.sql	2025-08-24 05:03:31.607363	started	\N	\N	0
1149	011_create_performance_indexes.sql	2025-08-24 05:03:31.607363	completed	\N	\N	0
1250	007_enrich_tours_table.sql	2025-08-24 06:15:02.143898	started	\N	\N	0
1151	001_backup_preparation.sql	2025-08-24 05:09:54.965232	completed	\N	\N	0
1152	002_create_tour_categories.sql	2025-08-24 05:09:55.01936	started	\N	\N	0
1153	002_create_tour_categories.sql	2025-08-24 05:09:55.01936	completed	\N	\N	8
1154	003_create_special_offers.sql	2025-08-24 05:09:55.27152	started	\N	\N	0
1155	003_create_special_offers.sql	2025-08-24 05:09:55.27152	completed	\N	\N	3
1156	004_create_tour_statistics.sql	2025-08-24 05:09:55.618229	started	\N	\N	0
1157	004_create_tour_statistics.sql	2025-08-24 05:09:55.618229	completed	\N	\N	0
1158	005_create_featured_reviews.sql	2025-08-24 05:09:55.974082	started	\N	\N	0
1159	005_create_featured_reviews.sql	2025-08-24 05:09:55.974082	completed	\N	\N	5
1160	006_create_homepage_settings.sql	2025-08-24 05:09:56.560121	started	\N	\N	0
1161	006_create_homepage_settings.sql	2025-08-24 05:09:56.560121	completed	\N	\N	10
1162	007_enrich_tours_table.sql	2025-08-24 05:09:57.093249	started	\N	\N	0
1163	007_enrich_tours_table.sql	2025-08-24 05:09:57.093249	completed	\N	\N	6
1164	008_enrich_blog_posts_table.sql	2025-08-24 05:09:57.791048	started	\N	\N	0
1165	008_enrich_blog_posts_table.sql	2025-08-24 05:09:57.791048	completed	\N	\N	0
1166	009_enrich_destinations_table.sql	2025-08-24 05:09:58.49148	started	\N	\N	0
1167	009_enrich_destinations_table.sql	2025-08-24 05:09:58.49148	completed	\N	\N	6
1168	010_create_foreign_keys_constraints.sql	2025-08-24 05:09:59.575156	started	\N	\N	0
1169	010_create_foreign_keys_constraints.sql	2025-08-24 05:09:59.575156	completed	\N	\N	0
1170	011_create_performance_indexes.sql	2025-08-24 05:10:00.58376	started	\N	\N	0
1171	011_create_performance_indexes.sql	2025-08-24 05:10:00.58376	completed	\N	\N	0
1251	007_enrich_tours_table.sql	2025-08-24 06:15:02.143898	completed	\N	\N	6
1173	001_backup_preparation.sql	2025-08-24 05:12:48.197971	completed	\N	\N	0
1174	002_create_tour_categories.sql	2025-08-24 05:12:48.246518	started	\N	\N	0
1175	002_create_tour_categories.sql	2025-08-24 05:12:48.246518	completed	\N	\N	8
1176	003_create_special_offers.sql	2025-08-24 05:12:48.544104	started	\N	\N	0
1177	003_create_special_offers.sql	2025-08-24 05:12:48.544104	completed	\N	\N	3
1178	004_create_tour_statistics.sql	2025-08-24 05:12:48.938128	started	\N	\N	0
1179	004_create_tour_statistics.sql	2025-08-24 05:12:48.938128	completed	\N	\N	0
1180	005_create_featured_reviews.sql	2025-08-24 05:12:49.456281	started	\N	\N	0
1181	005_create_featured_reviews.sql	2025-08-24 05:12:49.456281	completed	\N	\N	5
1182	006_create_homepage_settings.sql	2025-08-24 05:12:49.995515	started	\N	\N	0
1183	006_create_homepage_settings.sql	2025-08-24 05:12:49.995515	completed	\N	\N	10
1184	007_enrich_tours_table.sql	2025-08-24 05:12:50.604658	started	\N	\N	0
1185	007_enrich_tours_table.sql	2025-08-24 05:12:50.604658	completed	\N	\N	6
1186	008_enrich_blog_posts_table.sql	2025-08-24 05:12:51.668328	started	\N	\N	0
1187	008_enrich_blog_posts_table.sql	2025-08-24 05:12:51.668328	completed	\N	\N	0
1188	009_enrich_destinations_table.sql	2025-08-24 05:12:52.408743	started	\N	\N	0
1189	009_enrich_destinations_table.sql	2025-08-24 05:12:52.408743	completed	\N	\N	6
1190	010_create_foreign_keys_constraints.sql	2025-08-24 05:12:53.477942	started	\N	\N	0
1191	010_create_foreign_keys_constraints.sql	2025-08-24 05:12:53.477942	completed	\N	\N	0
1192	011_create_performance_indexes.sql	2025-08-24 05:12:54.657815	started	\N	\N	0
1193	011_create_performance_indexes.sql	2025-08-24 05:12:54.657815	completed	\N	\N	0
1252	008_enrich_blog_posts_table.sql	2025-08-24 06:15:02.774733	started	\N	\N	0
1253	008_enrich_blog_posts_table.sql	2025-08-24 06:15:02.774733	completed	\N	\N	0
1254	009_enrich_destinations_table.sql	2025-08-24 06:15:03.496229	started	\N	\N	0
1255	009_enrich_destinations_table.sql	2025-08-24 06:15:03.496229	completed	\N	\N	6
1256	010_create_foreign_keys_constraints.sql	2025-08-24 06:15:04.481286	started	\N	\N	0
1257	010_create_foreign_keys_constraints.sql	2025-08-24 06:15:04.481286	completed	\N	\N	0
2685	003_create_special_offers.sql	2025-08-24 07:58:36.814384	started	\N	\N	0
1281	001_backup_preparation.sql	2025-08-24 06:19:47.419853	completed	\N	\N	0
1282	002_create_tour_categories.sql	2025-08-24 06:19:47.470158	started	\N	\N	0
1203	016_remove_duration_difficulty_fields.sql	2025-08-24 05:59:24.13043	started	\N	\N	0
1204	016_remove_duration_difficulty_fields.sql	2025-08-24 05:59:24.13043	completed	\N	\N	0
1283	002_create_tour_categories.sql	2025-08-24 06:19:47.470158	completed	\N	\N	8
1284	003_create_special_offers.sql	2025-08-24 06:19:47.764033	started	\N	\N	0
1285	003_create_special_offers.sql	2025-08-24 06:19:47.764033	completed	\N	\N	2
1286	004_create_tour_statistics.sql	2025-08-24 06:19:48.061774	started	\N	\N	0
1287	004_create_tour_statistics.sql	2025-08-24 06:19:48.061774	completed	\N	\N	0
1288	005_create_featured_reviews.sql	2025-08-24 06:19:48.475646	started	\N	\N	0
1289	005_create_featured_reviews.sql	2025-08-24 06:19:48.475646	completed	\N	\N	5
1290	006_create_homepage_settings.sql	2025-08-24 06:19:48.923839	started	\N	\N	0
1291	006_create_homepage_settings.sql	2025-08-24 06:19:48.923839	completed	\N	\N	10
1292	007_enrich_tours_table.sql	2025-08-24 06:19:49.360041	started	\N	\N	0
1293	007_enrich_tours_table.sql	2025-08-24 06:19:49.360041	completed	\N	\N	6
1294	008_enrich_blog_posts_table.sql	2025-08-24 06:19:50.127877	started	\N	\N	0
1295	008_enrich_blog_posts_table.sql	2025-08-24 06:19:50.127877	completed	\N	\N	0
1296	009_enrich_destinations_table.sql	2025-08-24 06:19:50.856347	started	\N	\N	0
1297	009_enrich_destinations_table.sql	2025-08-24 06:19:50.856347	completed	\N	\N	6
1298	010_create_foreign_keys_constraints.sql	2025-08-24 06:19:51.904203	started	\N	\N	0
1299	010_create_foreign_keys_constraints.sql	2025-08-24 06:19:51.904203	completed	\N	\N	0
1300	011_create_performance_indexes.sql	2025-08-24 06:19:52.84214	started	\N	\N	0
1301	011_create_performance_indexes.sql	2025-08-24 06:19:52.84214	completed	\N	\N	0
2686	003_create_special_offers.sql	2025-08-24 07:58:36.814384	completed	\N	\N	2
1304	002_create_tour_categories.sql	2025-08-24 06:21:53.1081	started	\N	\N	0
1305	002_create_tour_categories.sql	2025-08-24 06:21:53.1081	completed	\N	\N	8
1306	003_create_special_offers.sql	2025-08-24 06:21:53.360877	started	\N	\N	0
1307	003_create_special_offers.sql	2025-08-24 06:21:53.360877	completed	\N	\N	2
1308	004_create_tour_statistics.sql	2025-08-24 06:21:53.728757	started	\N	\N	0
1309	004_create_tour_statistics.sql	2025-08-24 06:21:53.728757	completed	\N	\N	0
1310	005_create_featured_reviews.sql	2025-08-24 06:21:54.088891	started	\N	\N	0
1311	005_create_featured_reviews.sql	2025-08-24 06:21:54.088891	completed	\N	\N	5
1312	006_create_homepage_settings.sql	2025-08-24 06:21:54.554225	started	\N	\N	0
1313	006_create_homepage_settings.sql	2025-08-24 06:21:54.554225	completed	\N	\N	10
1314	007_enrich_tours_table.sql	2025-08-24 06:21:54.997707	started	\N	\N	0
1315	007_enrich_tours_table.sql	2025-08-24 06:21:54.997707	completed	\N	\N	6
1316	008_enrich_blog_posts_table.sql	2025-08-24 06:21:55.678661	started	\N	\N	0
1317	008_enrich_blog_posts_table.sql	2025-08-24 06:21:55.678661	completed	\N	\N	0
1318	009_enrich_destinations_table.sql	2025-08-24 06:21:56.474226	started	\N	\N	0
1319	009_enrich_destinations_table.sql	2025-08-24 06:21:56.474226	completed	\N	\N	6
1320	010_create_foreign_keys_constraints.sql	2025-08-24 06:21:57.788991	started	\N	\N	0
1321	010_create_foreign_keys_constraints.sql	2025-08-24 06:21:57.788991	completed	\N	\N	0
1322	011_create_performance_indexes.sql	2025-08-24 06:21:58.636526	started	\N	\N	0
1323	011_create_performance_indexes.sql	2025-08-24 06:21:58.636526	completed	\N	\N	0
2687	004_create_tour_statistics.sql	2025-08-24 07:58:37.114932	started	\N	\N	0
1325	001_backup_preparation.sql	2025-08-24 06:27:01.252845	completed	\N	\N	0
1326	002_create_tour_categories.sql	2025-08-24 06:27:01.313323	started	\N	\N	0
1327	002_create_tour_categories.sql	2025-08-24 06:27:01.313323	completed	\N	\N	8
1328	003_create_special_offers.sql	2025-08-24 06:27:01.887907	started	\N	\N	0
1329	003_create_special_offers.sql	2025-08-24 06:27:01.887907	completed	\N	\N	2
1330	004_create_tour_statistics.sql	2025-08-24 06:27:02.38239	started	\N	\N	0
1331	004_create_tour_statistics.sql	2025-08-24 06:27:02.38239	completed	\N	\N	0
1332	005_create_featured_reviews.sql	2025-08-24 06:27:02.799127	started	\N	\N	0
1333	005_create_featured_reviews.sql	2025-08-24 06:27:02.799127	completed	\N	\N	5
1334	006_create_homepage_settings.sql	2025-08-24 06:27:03.313254	started	\N	\N	0
1335	006_create_homepage_settings.sql	2025-08-24 06:27:03.313254	completed	\N	\N	10
1336	007_enrich_tours_table.sql	2025-08-24 06:27:03.767112	started	\N	\N	0
1337	007_enrich_tours_table.sql	2025-08-24 06:27:03.767112	completed	\N	\N	6
1338	008_enrich_blog_posts_table.sql	2025-08-24 06:27:04.443593	started	\N	\N	0
1339	008_enrich_blog_posts_table.sql	2025-08-24 06:27:04.443593	completed	\N	\N	0
1340	009_enrich_destinations_table.sql	2025-08-24 06:27:05.150499	started	\N	\N	0
1341	009_enrich_destinations_table.sql	2025-08-24 06:27:05.150499	completed	\N	\N	6
1342	010_create_foreign_keys_constraints.sql	2025-08-24 06:27:06.287192	started	\N	\N	0
1343	010_create_foreign_keys_constraints.sql	2025-08-24 06:27:06.287192	completed	\N	\N	0
1344	011_create_performance_indexes.sql	2025-08-24 06:27:07.102096	started	\N	\N	0
1345	011_create_performance_indexes.sql	2025-08-24 06:27:07.102096	completed	\N	\N	0
2688	004_create_tour_statistics.sql	2025-08-24 07:58:37.114932	completed	\N	\N	0
1347	001_backup_preparation.sql	2025-08-24 06:30:22.953647	completed	\N	\N	0
1348	002_create_tour_categories.sql	2025-08-24 06:30:23.023772	started	\N	\N	0
1349	002_create_tour_categories.sql	2025-08-24 06:30:23.023772	completed	\N	\N	8
1350	003_create_special_offers.sql	2025-08-24 06:30:23.274389	started	\N	\N	0
1351	003_create_special_offers.sql	2025-08-24 06:30:23.274389	completed	\N	\N	2
1352	004_create_tour_statistics.sql	2025-08-24 06:30:23.564513	started	\N	\N	0
1353	004_create_tour_statistics.sql	2025-08-24 06:30:23.564513	completed	\N	\N	0
1354	005_create_featured_reviews.sql	2025-08-24 06:30:23.895399	started	\N	\N	0
1355	005_create_featured_reviews.sql	2025-08-24 06:30:23.895399	completed	\N	\N	5
1356	006_create_homepage_settings.sql	2025-08-24 06:30:24.332478	started	\N	\N	0
1357	006_create_homepage_settings.sql	2025-08-24 06:30:24.332478	completed	\N	\N	10
1358	007_enrich_tours_table.sql	2025-08-24 06:30:24.820876	started	\N	\N	0
1359	007_enrich_tours_table.sql	2025-08-24 06:30:24.820876	completed	\N	\N	6
1360	008_enrich_blog_posts_table.sql	2025-08-24 06:30:25.481671	started	\N	\N	0
1361	008_enrich_blog_posts_table.sql	2025-08-24 06:30:25.481671	completed	\N	\N	0
1362	009_enrich_destinations_table.sql	2025-08-24 06:30:26.167505	started	\N	\N	0
1363	009_enrich_destinations_table.sql	2025-08-24 06:30:26.167505	completed	\N	\N	6
1364	010_create_foreign_keys_constraints.sql	2025-08-24 06:30:27.556529	started	\N	\N	0
1365	010_create_foreign_keys_constraints.sql	2025-08-24 06:30:27.556529	completed	\N	\N	0
1366	011_create_performance_indexes.sql	2025-08-24 06:30:28.408832	started	\N	\N	0
1367	011_create_performance_indexes.sql	2025-08-24 06:30:28.408832	completed	\N	\N	0
2689	005_create_featured_reviews.sql	2025-08-24 07:58:37.48313	started	\N	\N	0
1369	001_backup_preparation.sql	2025-08-24 06:31:45.398493	completed	\N	\N	0
1370	002_create_tour_categories.sql	2025-08-24 06:31:45.467562	started	\N	\N	0
1371	002_create_tour_categories.sql	2025-08-24 06:31:45.467562	completed	\N	\N	8
1372	003_create_special_offers.sql	2025-08-24 06:31:45.736457	started	\N	\N	0
1373	003_create_special_offers.sql	2025-08-24 06:31:45.736457	completed	\N	\N	2
1374	004_create_tour_statistics.sql	2025-08-24 06:31:46.048639	started	\N	\N	0
1375	004_create_tour_statistics.sql	2025-08-24 06:31:46.048639	completed	\N	\N	0
1376	005_create_featured_reviews.sql	2025-08-24 06:31:46.502716	started	\N	\N	0
1377	005_create_featured_reviews.sql	2025-08-24 06:31:46.502716	completed	\N	\N	5
1378	006_create_homepage_settings.sql	2025-08-24 06:31:46.983669	started	\N	\N	0
1379	006_create_homepage_settings.sql	2025-08-24 06:31:46.983669	completed	\N	\N	10
1380	007_enrich_tours_table.sql	2025-08-24 06:31:47.39977	started	\N	\N	0
1381	007_enrich_tours_table.sql	2025-08-24 06:31:47.39977	completed	\N	\N	6
1382	008_enrich_blog_posts_table.sql	2025-08-24 06:31:48.017007	started	\N	\N	0
1383	008_enrich_blog_posts_table.sql	2025-08-24 06:31:48.017007	completed	\N	\N	0
1384	009_enrich_destinations_table.sql	2025-08-24 06:31:48.765913	started	\N	\N	0
1385	009_enrich_destinations_table.sql	2025-08-24 06:31:48.765913	completed	\N	\N	6
1386	010_create_foreign_keys_constraints.sql	2025-08-24 06:31:49.741291	started	\N	\N	0
1387	010_create_foreign_keys_constraints.sql	2025-08-24 06:31:49.741291	completed	\N	\N	0
1388	011_create_performance_indexes.sql	2025-08-24 06:31:50.59759	started	\N	\N	0
1389	011_create_performance_indexes.sql	2025-08-24 06:31:50.59759	completed	\N	\N	0
2690	005_create_featured_reviews.sql	2025-08-24 07:58:37.48313	completed	\N	\N	5
1391	001_backup_preparation.sql	2025-08-24 06:33:45.136538	completed	\N	\N	0
1392	002_create_tour_categories.sql	2025-08-24 06:33:45.195	started	\N	\N	0
1393	002_create_tour_categories.sql	2025-08-24 06:33:45.195	completed	\N	\N	8
1394	003_create_special_offers.sql	2025-08-24 06:33:45.496636	started	\N	\N	0
1395	003_create_special_offers.sql	2025-08-24 06:33:45.496636	completed	\N	\N	2
1396	004_create_tour_statistics.sql	2025-08-24 06:33:45.921939	started	\N	\N	0
1397	004_create_tour_statistics.sql	2025-08-24 06:33:45.921939	completed	\N	\N	0
1398	005_create_featured_reviews.sql	2025-08-24 06:33:46.274197	started	\N	\N	0
1399	005_create_featured_reviews.sql	2025-08-24 06:33:46.274197	completed	\N	\N	5
1400	006_create_homepage_settings.sql	2025-08-24 06:33:46.84789	started	\N	\N	0
1401	006_create_homepage_settings.sql	2025-08-24 06:33:46.84789	completed	\N	\N	10
1402	007_enrich_tours_table.sql	2025-08-24 06:33:47.258456	started	\N	\N	0
1403	007_enrich_tours_table.sql	2025-08-24 06:33:47.258456	completed	\N	\N	6
1404	008_enrich_blog_posts_table.sql	2025-08-24 06:33:47.859887	started	\N	\N	0
1405	008_enrich_blog_posts_table.sql	2025-08-24 06:33:47.859887	completed	\N	\N	0
1406	009_enrich_destinations_table.sql	2025-08-24 06:33:48.504018	started	\N	\N	0
1407	009_enrich_destinations_table.sql	2025-08-24 06:33:48.504018	completed	\N	\N	6
1408	010_create_foreign_keys_constraints.sql	2025-08-24 06:33:49.598761	started	\N	\N	0
1409	010_create_foreign_keys_constraints.sql	2025-08-24 06:33:49.598761	completed	\N	\N	0
1410	011_create_performance_indexes.sql	2025-08-24 06:33:50.491779	started	\N	\N	0
1411	011_create_performance_indexes.sql	2025-08-24 06:33:50.491779	completed	\N	\N	0
2691	006_create_homepage_settings.sql	2025-08-24 07:58:37.960455	started	\N	\N	0
1413	001_backup_preparation.sql	2025-08-24 06:38:03.036426	completed	\N	\N	0
1414	002_create_tour_categories.sql	2025-08-24 06:38:03.082273	started	\N	\N	0
1415	002_create_tour_categories.sql	2025-08-24 06:38:03.082273	completed	\N	\N	8
1416	003_create_special_offers.sql	2025-08-24 06:38:03.307972	started	\N	\N	0
1417	003_create_special_offers.sql	2025-08-24 06:38:03.307972	completed	\N	\N	2
1418	004_create_tour_statistics.sql	2025-08-24 06:38:03.582814	started	\N	\N	0
1419	004_create_tour_statistics.sql	2025-08-24 06:38:03.582814	completed	\N	\N	0
1420	005_create_featured_reviews.sql	2025-08-24 06:38:03.925549	started	\N	\N	0
1421	005_create_featured_reviews.sql	2025-08-24 06:38:03.925549	completed	\N	\N	5
1422	006_create_homepage_settings.sql	2025-08-24 06:38:04.58673	started	\N	\N	0
1423	006_create_homepage_settings.sql	2025-08-24 06:38:04.58673	completed	\N	\N	10
1424	007_enrich_tours_table.sql	2025-08-24 06:38:05.05002	started	\N	\N	0
1425	007_enrich_tours_table.sql	2025-08-24 06:38:05.05002	completed	\N	\N	6
1426	008_enrich_blog_posts_table.sql	2025-08-24 06:38:05.722899	started	\N	\N	0
1427	008_enrich_blog_posts_table.sql	2025-08-24 06:38:05.722899	completed	\N	\N	0
1428	009_enrich_destinations_table.sql	2025-08-24 06:38:06.546683	started	\N	\N	0
1429	009_enrich_destinations_table.sql	2025-08-24 06:38:06.546683	completed	\N	\N	6
1430	010_create_foreign_keys_constraints.sql	2025-08-24 06:38:07.751974	started	\N	\N	0
1431	010_create_foreign_keys_constraints.sql	2025-08-24 06:38:07.751974	completed	\N	\N	0
1432	011_create_performance_indexes.sql	2025-08-24 06:38:08.57483	started	\N	\N	0
1433	011_create_performance_indexes.sql	2025-08-24 06:38:08.57483	completed	\N	\N	0
2692	006_create_homepage_settings.sql	2025-08-24 07:58:37.960455	completed	\N	\N	10
1435	001_backup_preparation.sql	2025-08-24 06:40:13.993456	completed	\N	\N	0
1436	002_create_tour_categories.sql	2025-08-24 06:40:14.068082	started	\N	\N	0
1437	002_create_tour_categories.sql	2025-08-24 06:40:14.068082	completed	\N	\N	8
1438	003_create_special_offers.sql	2025-08-24 06:40:14.298534	started	\N	\N	0
1439	003_create_special_offers.sql	2025-08-24 06:40:14.298534	completed	\N	\N	2
1440	004_create_tour_statistics.sql	2025-08-24 06:40:14.586737	started	\N	\N	0
1441	004_create_tour_statistics.sql	2025-08-24 06:40:14.586737	completed	\N	\N	0
1442	005_create_featured_reviews.sql	2025-08-24 06:40:14.919008	started	\N	\N	0
1443	005_create_featured_reviews.sql	2025-08-24 06:40:14.919008	completed	\N	\N	5
1444	006_create_homepage_settings.sql	2025-08-24 06:40:15.447236	started	\N	\N	0
1445	006_create_homepage_settings.sql	2025-08-24 06:40:15.447236	completed	\N	\N	10
1446	007_enrich_tours_table.sql	2025-08-24 06:40:15.988411	started	\N	\N	0
1447	007_enrich_tours_table.sql	2025-08-24 06:40:15.988411	completed	\N	\N	6
1448	008_enrich_blog_posts_table.sql	2025-08-24 06:40:16.649634	started	\N	\N	0
1449	008_enrich_blog_posts_table.sql	2025-08-24 06:40:16.649634	completed	\N	\N	0
1450	009_enrich_destinations_table.sql	2025-08-24 06:40:17.29923	started	\N	\N	0
1451	009_enrich_destinations_table.sql	2025-08-24 06:40:17.29923	completed	\N	\N	6
1452	010_create_foreign_keys_constraints.sql	2025-08-24 06:40:18.342599	started	\N	\N	0
1453	010_create_foreign_keys_constraints.sql	2025-08-24 06:40:18.342599	completed	\N	\N	0
1454	011_create_performance_indexes.sql	2025-08-24 06:40:19.229692	started	\N	\N	0
1455	011_create_performance_indexes.sql	2025-08-24 06:40:19.229692	completed	\N	\N	0
2693	007_enrich_tours_table.sql	2025-08-24 07:58:38.425068	started	\N	\N	0
1457	001_backup_preparation.sql	2025-08-24 06:41:40.337005	completed	\N	\N	0
1458	002_create_tour_categories.sql	2025-08-24 06:41:40.413164	started	\N	\N	0
1459	002_create_tour_categories.sql	2025-08-24 06:41:40.413164	completed	\N	\N	8
1460	003_create_special_offers.sql	2025-08-24 06:41:40.701755	started	\N	\N	0
1461	003_create_special_offers.sql	2025-08-24 06:41:40.701755	completed	\N	\N	2
1462	004_create_tour_statistics.sql	2025-08-24 06:41:41.18647	started	\N	\N	0
1463	004_create_tour_statistics.sql	2025-08-24 06:41:41.18647	completed	\N	\N	0
1464	005_create_featured_reviews.sql	2025-08-24 06:41:41.730036	started	\N	\N	0
1465	005_create_featured_reviews.sql	2025-08-24 06:41:41.730036	completed	\N	\N	5
1466	006_create_homepage_settings.sql	2025-08-24 06:41:42.227766	started	\N	\N	0
1467	006_create_homepage_settings.sql	2025-08-24 06:41:42.227766	completed	\N	\N	10
1468	007_enrich_tours_table.sql	2025-08-24 06:41:42.675025	started	\N	\N	0
1469	007_enrich_tours_table.sql	2025-08-24 06:41:42.675025	completed	\N	\N	6
1470	008_enrich_blog_posts_table.sql	2025-08-24 06:41:43.334341	started	\N	\N	0
1471	008_enrich_blog_posts_table.sql	2025-08-24 06:41:43.334341	completed	\N	\N	0
1472	009_enrich_destinations_table.sql	2025-08-24 06:41:44.056624	started	\N	\N	0
1473	009_enrich_destinations_table.sql	2025-08-24 06:41:44.056624	completed	\N	\N	6
1474	010_create_foreign_keys_constraints.sql	2025-08-24 06:41:45.157252	started	\N	\N	0
1475	010_create_foreign_keys_constraints.sql	2025-08-24 06:41:45.157252	completed	\N	\N	0
1476	011_create_performance_indexes.sql	2025-08-24 06:41:46.42273	started	\N	\N	0
1477	011_create_performance_indexes.sql	2025-08-24 06:41:46.42273	completed	\N	\N	0
2694	007_enrich_tours_table.sql	2025-08-24 07:58:38.425068	completed	\N	\N	11
1479	001_backup_preparation.sql	2025-08-24 06:43:59.365355	completed	\N	\N	0
1480	002_create_tour_categories.sql	2025-08-24 06:43:59.406393	started	\N	\N	0
1481	002_create_tour_categories.sql	2025-08-24 06:43:59.406393	completed	\N	\N	8
1482	003_create_special_offers.sql	2025-08-24 06:43:59.635659	started	\N	\N	0
1483	003_create_special_offers.sql	2025-08-24 06:43:59.635659	completed	\N	\N	2
1484	004_create_tour_statistics.sql	2025-08-24 06:44:00.018387	started	\N	\N	0
1485	004_create_tour_statistics.sql	2025-08-24 06:44:00.018387	completed	\N	\N	0
1486	005_create_featured_reviews.sql	2025-08-24 06:44:00.374621	started	\N	\N	0
1487	005_create_featured_reviews.sql	2025-08-24 06:44:00.374621	completed	\N	\N	5
1488	006_create_homepage_settings.sql	2025-08-24 06:44:00.837605	started	\N	\N	0
1489	006_create_homepage_settings.sql	2025-08-24 06:44:00.837605	completed	\N	\N	10
1490	007_enrich_tours_table.sql	2025-08-24 06:44:01.32951	started	\N	\N	0
1491	007_enrich_tours_table.sql	2025-08-24 06:44:01.32951	completed	\N	\N	6
1492	008_enrich_blog_posts_table.sql	2025-08-24 06:44:02.01301	started	\N	\N	0
1493	008_enrich_blog_posts_table.sql	2025-08-24 06:44:02.01301	completed	\N	\N	0
1494	009_enrich_destinations_table.sql	2025-08-24 06:44:02.786234	started	\N	\N	0
1495	009_enrich_destinations_table.sql	2025-08-24 06:44:02.786234	completed	\N	\N	6
1496	010_create_foreign_keys_constraints.sql	2025-08-24 06:44:03.80112	started	\N	\N	0
1497	010_create_foreign_keys_constraints.sql	2025-08-24 06:44:03.80112	completed	\N	\N	0
1498	011_create_performance_indexes.sql	2025-08-24 06:44:04.601524	started	\N	\N	0
1499	011_create_performance_indexes.sql	2025-08-24 06:44:04.601524	completed	\N	\N	0
2695	008_enrich_blog_posts_table.sql	2025-08-24 07:58:39.076281	started	\N	\N	0
1501	001_backup_preparation.sql	2025-08-24 06:47:28.611133	completed	\N	\N	0
1502	002_create_tour_categories.sql	2025-08-24 06:47:28.67057	started	\N	\N	0
1503	002_create_tour_categories.sql	2025-08-24 06:47:28.67057	completed	\N	\N	8
1504	003_create_special_offers.sql	2025-08-24 06:47:28.978447	started	\N	\N	0
1505	003_create_special_offers.sql	2025-08-24 06:47:28.978447	completed	\N	\N	2
1506	004_create_tour_statistics.sql	2025-08-24 06:47:29.362816	started	\N	\N	0
1507	004_create_tour_statistics.sql	2025-08-24 06:47:29.362816	completed	\N	\N	0
1508	005_create_featured_reviews.sql	2025-08-24 06:47:29.788509	started	\N	\N	0
1509	005_create_featured_reviews.sql	2025-08-24 06:47:29.788509	completed	\N	\N	5
1510	006_create_homepage_settings.sql	2025-08-24 06:47:30.40788	started	\N	\N	0
1511	006_create_homepage_settings.sql	2025-08-24 06:47:30.40788	completed	\N	\N	10
1512	007_enrich_tours_table.sql	2025-08-24 06:47:30.917622	started	\N	\N	0
1513	007_enrich_tours_table.sql	2025-08-24 06:47:30.917622	completed	\N	\N	6
1514	008_enrich_blog_posts_table.sql	2025-08-24 06:47:31.531206	started	\N	\N	0
1515	008_enrich_blog_posts_table.sql	2025-08-24 06:47:31.531206	completed	\N	\N	0
1516	009_enrich_destinations_table.sql	2025-08-24 06:47:32.149462	started	\N	\N	0
1517	009_enrich_destinations_table.sql	2025-08-24 06:47:32.149462	completed	\N	\N	6
1518	010_create_foreign_keys_constraints.sql	2025-08-24 06:47:33.135444	started	\N	\N	0
1519	010_create_foreign_keys_constraints.sql	2025-08-24 06:47:33.135444	completed	\N	\N	0
1520	011_create_performance_indexes.sql	2025-08-24 06:47:33.928095	started	\N	\N	0
1521	011_create_performance_indexes.sql	2025-08-24 06:47:33.928095	completed	\N	\N	0
2696	008_enrich_blog_posts_table.sql	2025-08-24 07:58:39.076281	completed	\N	\N	4
1523	001_backup_preparation.sql	2025-08-24 06:49:48.311606	completed	\N	\N	0
1524	002_create_tour_categories.sql	2025-08-24 06:49:48.351142	started	\N	\N	0
1525	002_create_tour_categories.sql	2025-08-24 06:49:48.351142	completed	\N	\N	8
1526	003_create_special_offers.sql	2025-08-24 06:49:48.584587	started	\N	\N	0
1527	003_create_special_offers.sql	2025-08-24 06:49:48.584587	completed	\N	\N	2
1528	004_create_tour_statistics.sql	2025-08-24 06:49:48.880283	started	\N	\N	0
1529	004_create_tour_statistics.sql	2025-08-24 06:49:48.880283	completed	\N	\N	0
1530	005_create_featured_reviews.sql	2025-08-24 06:49:49.330789	started	\N	\N	0
1531	005_create_featured_reviews.sql	2025-08-24 06:49:49.330789	completed	\N	\N	5
1532	006_create_homepage_settings.sql	2025-08-24 06:49:49.764999	started	\N	\N	0
1533	006_create_homepage_settings.sql	2025-08-24 06:49:49.764999	completed	\N	\N	10
1534	007_enrich_tours_table.sql	2025-08-24 06:49:50.176591	started	\N	\N	0
1535	007_enrich_tours_table.sql	2025-08-24 06:49:50.176591	completed	\N	\N	6
1536	008_enrich_blog_posts_table.sql	2025-08-24 06:49:50.785118	started	\N	\N	0
1537	008_enrich_blog_posts_table.sql	2025-08-24 06:49:50.785118	completed	\N	\N	0
1538	009_enrich_destinations_table.sql	2025-08-24 06:49:51.455758	started	\N	\N	0
1539	009_enrich_destinations_table.sql	2025-08-24 06:49:51.455758	completed	\N	\N	6
1540	010_create_foreign_keys_constraints.sql	2025-08-24 06:49:52.466516	started	\N	\N	0
1541	010_create_foreign_keys_constraints.sql	2025-08-24 06:49:52.466516	completed	\N	\N	0
1542	011_create_performance_indexes.sql	2025-08-24 06:49:53.259772	started	\N	\N	0
1543	011_create_performance_indexes.sql	2025-08-24 06:49:53.259772	completed	\N	\N	0
2697	009_enrich_destinations_table.sql	2025-08-24 07:58:39.826749	started	\N	\N	0
1545	001_backup_preparation.sql	2025-08-24 06:50:42.633076	completed	\N	\N	0
1546	002_create_tour_categories.sql	2025-08-24 06:50:42.678646	started	\N	\N	0
1547	002_create_tour_categories.sql	2025-08-24 06:50:42.678646	completed	\N	\N	8
1548	003_create_special_offers.sql	2025-08-24 06:50:42.909829	started	\N	\N	0
1549	003_create_special_offers.sql	2025-08-24 06:50:42.909829	completed	\N	\N	2
1550	004_create_tour_statistics.sql	2025-08-24 06:50:43.198912	started	\N	\N	0
1551	004_create_tour_statistics.sql	2025-08-24 06:50:43.198912	completed	\N	\N	0
1552	005_create_featured_reviews.sql	2025-08-24 06:50:43.554944	started	\N	\N	0
1553	005_create_featured_reviews.sql	2025-08-24 06:50:43.554944	completed	\N	\N	5
1554	006_create_homepage_settings.sql	2025-08-24 06:50:43.998025	started	\N	\N	0
1555	006_create_homepage_settings.sql	2025-08-24 06:50:43.998025	completed	\N	\N	10
1556	007_enrich_tours_table.sql	2025-08-24 06:50:44.500143	started	\N	\N	0
1557	007_enrich_tours_table.sql	2025-08-24 06:50:44.500143	completed	\N	\N	6
1558	008_enrich_blog_posts_table.sql	2025-08-24 06:50:45.104155	started	\N	\N	0
1559	008_enrich_blog_posts_table.sql	2025-08-24 06:50:45.104155	completed	\N	\N	0
1560	009_enrich_destinations_table.sql	2025-08-24 06:50:45.727188	started	\N	\N	0
1561	009_enrich_destinations_table.sql	2025-08-24 06:50:45.727188	completed	\N	\N	6
1562	010_create_foreign_keys_constraints.sql	2025-08-24 06:50:46.774046	started	\N	\N	0
1563	010_create_foreign_keys_constraints.sql	2025-08-24 06:50:46.774046	completed	\N	\N	0
1564	011_create_performance_indexes.sql	2025-08-24 06:50:47.649872	started	\N	\N	0
1565	011_create_performance_indexes.sql	2025-08-24 06:50:47.649872	completed	\N	\N	0
2698	009_enrich_destinations_table.sql	2025-08-24 07:58:39.826749	completed	\N	\N	13
1567	001_backup_preparation.sql	2025-08-24 06:52:05.433307	completed	\N	\N	0
1568	002_create_tour_categories.sql	2025-08-24 06:52:05.478991	started	\N	\N	0
1569	002_create_tour_categories.sql	2025-08-24 06:52:05.478991	completed	\N	\N	8
1570	003_create_special_offers.sql	2025-08-24 06:52:05.706146	started	\N	\N	0
1571	003_create_special_offers.sql	2025-08-24 06:52:05.706146	completed	\N	\N	2
1572	004_create_tour_statistics.sql	2025-08-24 06:52:06.000071	started	\N	\N	0
1573	004_create_tour_statistics.sql	2025-08-24 06:52:06.000071	completed	\N	\N	0
1574	005_create_featured_reviews.sql	2025-08-24 06:52:06.332315	started	\N	\N	0
1575	005_create_featured_reviews.sql	2025-08-24 06:52:06.332315	completed	\N	\N	5
1576	006_create_homepage_settings.sql	2025-08-24 06:52:06.765796	started	\N	\N	0
1577	006_create_homepage_settings.sql	2025-08-24 06:52:06.765796	completed	\N	\N	10
1578	007_enrich_tours_table.sql	2025-08-24 06:52:07.314484	started	\N	\N	0
1579	007_enrich_tours_table.sql	2025-08-24 06:52:07.314484	completed	\N	\N	6
1580	008_enrich_blog_posts_table.sql	2025-08-24 06:52:07.954395	started	\N	\N	0
1581	008_enrich_blog_posts_table.sql	2025-08-24 06:52:07.954395	completed	\N	\N	0
1582	009_enrich_destinations_table.sql	2025-08-24 06:52:08.584983	started	\N	\N	0
1583	009_enrich_destinations_table.sql	2025-08-24 06:52:08.584983	completed	\N	\N	6
1584	010_create_foreign_keys_constraints.sql	2025-08-24 06:52:09.512648	started	\N	\N	0
1585	010_create_foreign_keys_constraints.sql	2025-08-24 06:52:09.512648	completed	\N	\N	0
1586	011_create_performance_indexes.sql	2025-08-24 06:52:10.391431	started	\N	\N	0
1587	011_create_performance_indexes.sql	2025-08-24 06:52:10.391431	completed	\N	\N	0
2699	010_create_foreign_keys_constraints.sql	2025-08-24 07:58:40.819263	started	\N	\N	0
1589	001_backup_preparation.sql	2025-08-24 06:52:53.620181	completed	\N	\N	0
1590	002_create_tour_categories.sql	2025-08-24 06:52:53.660177	started	\N	\N	0
1591	002_create_tour_categories.sql	2025-08-24 06:52:53.660177	completed	\N	\N	8
1592	003_create_special_offers.sql	2025-08-24 06:52:53.925883	started	\N	\N	0
1593	003_create_special_offers.sql	2025-08-24 06:52:53.925883	completed	\N	\N	2
1594	004_create_tour_statistics.sql	2025-08-24 06:52:54.207548	started	\N	\N	0
1595	004_create_tour_statistics.sql	2025-08-24 06:52:54.207548	completed	\N	\N	0
1596	005_create_featured_reviews.sql	2025-08-24 06:52:54.530166	started	\N	\N	0
1597	005_create_featured_reviews.sql	2025-08-24 06:52:54.530166	completed	\N	\N	5
1598	006_create_homepage_settings.sql	2025-08-24 06:52:54.950192	started	\N	\N	0
1599	006_create_homepage_settings.sql	2025-08-24 06:52:54.950192	completed	\N	\N	10
1600	007_enrich_tours_table.sql	2025-08-24 06:52:55.462257	started	\N	\N	0
1601	007_enrich_tours_table.sql	2025-08-24 06:52:55.462257	completed	\N	\N	6
1602	008_enrich_blog_posts_table.sql	2025-08-24 06:52:56.055874	started	\N	\N	0
1603	008_enrich_blog_posts_table.sql	2025-08-24 06:52:56.055874	completed	\N	\N	0
1604	009_enrich_destinations_table.sql	2025-08-24 06:52:56.702671	started	\N	\N	0
1605	009_enrich_destinations_table.sql	2025-08-24 06:52:56.702671	completed	\N	\N	6
1606	010_create_foreign_keys_constraints.sql	2025-08-24 06:52:57.685213	started	\N	\N	0
1607	010_create_foreign_keys_constraints.sql	2025-08-24 06:52:57.685213	completed	\N	\N	0
1608	011_create_performance_indexes.sql	2025-08-24 06:52:58.556408	started	\N	\N	0
1609	011_create_performance_indexes.sql	2025-08-24 06:52:58.556408	completed	\N	\N	0
1610	012_create_homepage_views.sql	2025-08-24 06:52:59.307702	started	\N	\N	0
1611	012_create_homepage_views.sql	2025-08-24 06:52:59.307702	completed	\N	\N	0
2700	010_create_foreign_keys_constraints.sql	2025-08-24 07:58:40.819263	completed	\N	\N	0
1613	001_backup_preparation.sql	2025-08-24 06:55:45.309291	completed	\N	\N	0
1614	002_create_tour_categories.sql	2025-08-24 06:55:45.382175	started	\N	\N	0
1615	002_create_tour_categories.sql	2025-08-24 06:55:45.382175	completed	\N	\N	8
1616	003_create_special_offers.sql	2025-08-24 06:55:45.621852	started	\N	\N	0
1617	003_create_special_offers.sql	2025-08-24 06:55:45.621852	completed	\N	\N	2
1618	004_create_tour_statistics.sql	2025-08-24 06:55:45.92081	started	\N	\N	0
1619	004_create_tour_statistics.sql	2025-08-24 06:55:45.92081	completed	\N	\N	0
1620	005_create_featured_reviews.sql	2025-08-24 06:55:46.297722	started	\N	\N	0
1621	005_create_featured_reviews.sql	2025-08-24 06:55:46.297722	completed	\N	\N	5
1622	006_create_homepage_settings.sql	2025-08-24 06:55:46.851551	started	\N	\N	0
1623	006_create_homepage_settings.sql	2025-08-24 06:55:46.851551	completed	\N	\N	10
1624	007_enrich_tours_table.sql	2025-08-24 06:55:47.247342	started	\N	\N	0
1625	007_enrich_tours_table.sql	2025-08-24 06:55:47.247342	completed	\N	\N	6
1626	008_enrich_blog_posts_table.sql	2025-08-24 06:55:47.904475	started	\N	\N	0
1627	008_enrich_blog_posts_table.sql	2025-08-24 06:55:47.904475	completed	\N	\N	0
1628	009_enrich_destinations_table.sql	2025-08-24 06:55:48.538805	started	\N	\N	0
1629	009_enrich_destinations_table.sql	2025-08-24 06:55:48.538805	completed	\N	\N	6
1630	010_create_foreign_keys_constraints.sql	2025-08-24 06:55:49.583815	started	\N	\N	0
1631	010_create_foreign_keys_constraints.sql	2025-08-24 06:55:49.583815	completed	\N	\N	0
1632	011_create_performance_indexes.sql	2025-08-24 06:55:50.367871	started	\N	\N	0
1633	011_create_performance_indexes.sql	2025-08-24 06:55:50.367871	completed	\N	\N	0
1634	012_create_homepage_views.sql	2025-08-24 06:55:51.153518	started	\N	\N	0
1635	012_create_homepage_views.sql	2025-08-24 06:55:51.153518	completed	\N	\N	0
1636	013_create_utility_functions.sql	2025-08-24 06:55:51.909462	started	\N	\N	0
1637	013_create_utility_functions.sql	2025-08-24 06:55:51.909462	completed	\N	\N	0
2701	011_create_performance_indexes.sql	2025-08-24 07:58:41.660539	started	\N	\N	0
1639	001_backup_preparation.sql	2025-08-24 06:57:11.001179	completed	\N	\N	0
1640	002_create_tour_categories.sql	2025-08-24 06:57:11.0733	started	\N	\N	0
1641	002_create_tour_categories.sql	2025-08-24 06:57:11.0733	completed	\N	\N	8
1642	003_create_special_offers.sql	2025-08-24 06:57:11.315552	started	\N	\N	0
1643	003_create_special_offers.sql	2025-08-24 06:57:11.315552	completed	\N	\N	2
1644	004_create_tour_statistics.sql	2025-08-24 06:57:11.606452	started	\N	\N	0
1645	004_create_tour_statistics.sql	2025-08-24 06:57:11.606452	completed	\N	\N	0
1646	005_create_featured_reviews.sql	2025-08-24 06:57:11.973317	started	\N	\N	0
1647	005_create_featured_reviews.sql	2025-08-24 06:57:11.973317	completed	\N	\N	5
1648	006_create_homepage_settings.sql	2025-08-24 06:57:12.426753	started	\N	\N	0
1649	006_create_homepage_settings.sql	2025-08-24 06:57:12.426753	completed	\N	\N	10
1650	007_enrich_tours_table.sql	2025-08-24 06:57:12.937976	started	\N	\N	0
1651	007_enrich_tours_table.sql	2025-08-24 06:57:12.937976	completed	\N	\N	6
1652	008_enrich_blog_posts_table.sql	2025-08-24 06:57:13.558644	started	\N	\N	0
1653	008_enrich_blog_posts_table.sql	2025-08-24 06:57:13.558644	completed	\N	\N	0
1654	009_enrich_destinations_table.sql	2025-08-24 06:57:14.225543	started	\N	\N	0
1655	009_enrich_destinations_table.sql	2025-08-24 06:57:14.225543	completed	\N	\N	6
1656	010_create_foreign_keys_constraints.sql	2025-08-24 06:57:15.237037	started	\N	\N	0
1657	010_create_foreign_keys_constraints.sql	2025-08-24 06:57:15.237037	completed	\N	\N	0
1658	011_create_performance_indexes.sql	2025-08-24 06:57:16.174361	started	\N	\N	0
1659	011_create_performance_indexes.sql	2025-08-24 06:57:16.174361	completed	\N	\N	0
1660	012_create_homepage_views.sql	2025-08-24 06:57:17.020187	started	\N	\N	0
1661	012_create_homepage_views.sql	2025-08-24 06:57:17.020187	completed	\N	\N	0
1662	013_create_utility_functions.sql	2025-08-24 06:57:17.796053	started	\N	\N	0
1663	013_create_utility_functions.sql	2025-08-24 06:57:17.796053	completed	\N	\N	0
2702	011_create_performance_indexes.sql	2025-08-24 07:58:41.660539	completed	\N	\N	0
1665	001_backup_preparation.sql	2025-08-24 07:00:49.681168	completed	\N	\N	0
1666	002_create_tour_categories.sql	2025-08-24 07:00:49.753608	started	\N	\N	0
1667	002_create_tour_categories.sql	2025-08-24 07:00:49.753608	completed	\N	\N	8
1668	003_create_special_offers.sql	2025-08-24 07:00:50.00911	started	\N	\N	0
1669	003_create_special_offers.sql	2025-08-24 07:00:50.00911	completed	\N	\N	2
1670	004_create_tour_statistics.sql	2025-08-24 07:00:50.298369	started	\N	\N	0
1671	004_create_tour_statistics.sql	2025-08-24 07:00:50.298369	completed	\N	\N	0
1672	005_create_featured_reviews.sql	2025-08-24 07:00:50.655046	started	\N	\N	0
1673	005_create_featured_reviews.sql	2025-08-24 07:00:50.655046	completed	\N	\N	5
1674	006_create_homepage_settings.sql	2025-08-24 07:00:51.145835	started	\N	\N	0
1675	006_create_homepage_settings.sql	2025-08-24 07:00:51.145835	completed	\N	\N	10
1676	007_enrich_tours_table.sql	2025-08-24 07:00:51.548012	started	\N	\N	0
1677	007_enrich_tours_table.sql	2025-08-24 07:00:51.548012	completed	\N	\N	6
1678	008_enrich_blog_posts_table.sql	2025-08-24 07:00:52.172504	started	\N	\N	0
1679	008_enrich_blog_posts_table.sql	2025-08-24 07:00:52.172504	completed	\N	\N	0
1680	009_enrich_destinations_table.sql	2025-08-24 07:00:52.969867	started	\N	\N	0
1681	009_enrich_destinations_table.sql	2025-08-24 07:00:52.969867	completed	\N	\N	6
1682	010_create_foreign_keys_constraints.sql	2025-08-24 07:00:53.92479	started	\N	\N	0
1683	010_create_foreign_keys_constraints.sql	2025-08-24 07:00:53.92479	completed	\N	\N	0
1684	011_create_performance_indexes.sql	2025-08-24 07:00:54.743797	started	\N	\N	0
1685	011_create_performance_indexes.sql	2025-08-24 07:00:54.743797	completed	\N	\N	0
1686	012_create_homepage_views.sql	2025-08-24 07:00:55.488272	started	\N	\N	0
1687	012_create_homepage_views.sql	2025-08-24 07:00:55.488272	completed	\N	\N	0
1688	013_create_utility_functions.sql	2025-08-24 07:00:56.380348	started	\N	\N	0
1689	013_create_utility_functions.sql	2025-08-24 07:00:56.380348	completed	\N	\N	0
2703	012_create_homepage_views.sql	2025-08-24 07:58:42.441401	started	\N	\N	0
1691	001_backup_preparation.sql	2025-08-24 07:03:46.508324	completed	\N	\N	0
1692	002_create_tour_categories.sql	2025-08-24 07:03:46.553486	started	\N	\N	0
1693	002_create_tour_categories.sql	2025-08-24 07:03:46.553486	completed	\N	\N	8
1694	003_create_special_offers.sql	2025-08-24 07:03:46.798369	started	\N	\N	0
1695	003_create_special_offers.sql	2025-08-24 07:03:46.798369	completed	\N	\N	2
1696	004_create_tour_statistics.sql	2025-08-24 07:03:47.185255	started	\N	\N	0
1697	004_create_tour_statistics.sql	2025-08-24 07:03:47.185255	completed	\N	\N	0
1698	005_create_featured_reviews.sql	2025-08-24 07:03:47.64765	started	\N	\N	0
1699	005_create_featured_reviews.sql	2025-08-24 07:03:47.64765	completed	\N	\N	5
1700	006_create_homepage_settings.sql	2025-08-24 07:03:48.090031	started	\N	\N	0
1701	006_create_homepage_settings.sql	2025-08-24 07:03:48.090031	completed	\N	\N	10
1702	007_enrich_tours_table.sql	2025-08-24 07:03:48.524651	started	\N	\N	0
1703	007_enrich_tours_table.sql	2025-08-24 07:03:48.524651	completed	\N	\N	6
1704	008_enrich_blog_posts_table.sql	2025-08-24 07:03:49.149696	started	\N	\N	0
1705	008_enrich_blog_posts_table.sql	2025-08-24 07:03:49.149696	completed	\N	\N	0
1706	009_enrich_destinations_table.sql	2025-08-24 07:03:49.817315	started	\N	\N	0
1707	009_enrich_destinations_table.sql	2025-08-24 07:03:49.817315	completed	\N	\N	6
1708	010_create_foreign_keys_constraints.sql	2025-08-24 07:03:50.958885	started	\N	\N	0
1709	010_create_foreign_keys_constraints.sql	2025-08-24 07:03:50.958885	completed	\N	\N	0
1710	011_create_performance_indexes.sql	2025-08-24 07:03:51.78293	started	\N	\N	0
1711	011_create_performance_indexes.sql	2025-08-24 07:03:51.78293	completed	\N	\N	0
1712	012_create_homepage_views.sql	2025-08-24 07:03:52.546333	started	\N	\N	0
1713	012_create_homepage_views.sql	2025-08-24 07:03:52.546333	completed	\N	\N	0
1714	013_create_utility_functions.sql	2025-08-24 07:03:53.443175	started	\N	\N	0
1715	013_create_utility_functions.sql	2025-08-24 07:03:53.443175	completed	\N	\N	0
2704	012_create_homepage_views.sql	2025-08-24 07:58:42.441401	completed	\N	\N	0
1717	001_backup_preparation.sql	2025-08-24 07:05:18.138061	completed	\N	\N	0
1718	002_create_tour_categories.sql	2025-08-24 07:05:18.216305	started	\N	\N	0
1719	002_create_tour_categories.sql	2025-08-24 07:05:18.216305	completed	\N	\N	8
1720	003_create_special_offers.sql	2025-08-24 07:05:18.630602	started	\N	\N	0
1721	003_create_special_offers.sql	2025-08-24 07:05:18.630602	completed	\N	\N	2
1722	004_create_tour_statistics.sql	2025-08-24 07:05:18.949471	started	\N	\N	0
1723	004_create_tour_statistics.sql	2025-08-24 07:05:18.949471	completed	\N	\N	0
1724	005_create_featured_reviews.sql	2025-08-24 07:05:19.355414	started	\N	\N	0
1725	005_create_featured_reviews.sql	2025-08-24 07:05:19.355414	completed	\N	\N	5
1726	006_create_homepage_settings.sql	2025-08-24 07:05:19.793863	started	\N	\N	0
1727	006_create_homepage_settings.sql	2025-08-24 07:05:19.793863	completed	\N	\N	10
1728	007_enrich_tours_table.sql	2025-08-24 07:05:20.221879	started	\N	\N	0
1729	007_enrich_tours_table.sql	2025-08-24 07:05:20.221879	completed	\N	\N	6
1730	008_enrich_blog_posts_table.sql	2025-08-24 07:05:20.892038	started	\N	\N	0
1731	008_enrich_blog_posts_table.sql	2025-08-24 07:05:20.892038	completed	\N	\N	0
1732	009_enrich_destinations_table.sql	2025-08-24 07:05:21.543531	started	\N	\N	0
1733	009_enrich_destinations_table.sql	2025-08-24 07:05:21.543531	completed	\N	\N	6
1734	010_create_foreign_keys_constraints.sql	2025-08-24 07:05:22.632327	started	\N	\N	0
1735	010_create_foreign_keys_constraints.sql	2025-08-24 07:05:22.632327	completed	\N	\N	0
1736	011_create_performance_indexes.sql	2025-08-24 07:05:23.430049	started	\N	\N	0
1737	011_create_performance_indexes.sql	2025-08-24 07:05:23.430049	completed	\N	\N	0
1738	012_create_homepage_views.sql	2025-08-24 07:05:24.216482	started	\N	\N	0
1739	012_create_homepage_views.sql	2025-08-24 07:05:24.216482	completed	\N	\N	0
1740	013_create_utility_functions.sql	2025-08-24 07:05:25.040474	started	\N	\N	0
1741	013_create_utility_functions.sql	2025-08-24 07:05:25.040474	completed	\N	\N	0
2705	013_create_utility_functions.sql	2025-08-24 07:58:43.230775	started	\N	\N	0
1743	001_backup_preparation.sql	2025-08-24 07:06:42.921197	completed	\N	\N	0
1744	002_create_tour_categories.sql	2025-08-24 07:06:42.960824	started	\N	\N	0
1745	002_create_tour_categories.sql	2025-08-24 07:06:42.960824	completed	\N	\N	8
1746	003_create_special_offers.sql	2025-08-24 07:06:43.19876	started	\N	\N	0
1747	003_create_special_offers.sql	2025-08-24 07:06:43.19876	completed	\N	\N	2
1748	004_create_tour_statistics.sql	2025-08-24 07:06:43.477613	started	\N	\N	0
1749	004_create_tour_statistics.sql	2025-08-24 07:06:43.477613	completed	\N	\N	0
1750	005_create_featured_reviews.sql	2025-08-24 07:06:43.818249	started	\N	\N	0
1751	005_create_featured_reviews.sql	2025-08-24 07:06:43.818249	completed	\N	\N	5
1752	006_create_homepage_settings.sql	2025-08-24 07:06:44.250768	started	\N	\N	0
1753	006_create_homepage_settings.sql	2025-08-24 07:06:44.250768	completed	\N	\N	10
1754	007_enrich_tours_table.sql	2025-08-24 07:06:44.655774	started	\N	\N	0
1755	007_enrich_tours_table.sql	2025-08-24 07:06:44.655774	completed	\N	\N	6
1756	008_enrich_blog_posts_table.sql	2025-08-24 07:06:45.348006	started	\N	\N	0
1757	008_enrich_blog_posts_table.sql	2025-08-24 07:06:45.348006	completed	\N	\N	0
1758	009_enrich_destinations_table.sql	2025-08-24 07:06:46.022379	started	\N	\N	0
1759	009_enrich_destinations_table.sql	2025-08-24 07:06:46.022379	completed	\N	\N	6
1760	010_create_foreign_keys_constraints.sql	2025-08-24 07:06:47.024822	started	\N	\N	0
1761	010_create_foreign_keys_constraints.sql	2025-08-24 07:06:47.024822	completed	\N	\N	0
1762	011_create_performance_indexes.sql	2025-08-24 07:06:47.857629	started	\N	\N	0
1763	011_create_performance_indexes.sql	2025-08-24 07:06:47.857629	completed	\N	\N	0
1764	012_create_homepage_views.sql	2025-08-24 07:06:48.729417	started	\N	\N	0
1765	012_create_homepage_views.sql	2025-08-24 07:06:48.729417	completed	\N	\N	0
1766	013_create_utility_functions.sql	2025-08-24 07:06:49.452523	started	\N	\N	0
1767	013_create_utility_functions.sql	2025-08-24 07:06:49.452523	completed	\N	\N	0
2706	013_create_utility_functions.sql	2025-08-24 07:58:43.230775	completed	\N	\N	0
1769	001_backup_preparation.sql	2025-08-24 07:08:24.352003	completed	\N	\N	0
1770	002_create_tour_categories.sql	2025-08-24 07:08:24.422203	started	\N	\N	0
1771	002_create_tour_categories.sql	2025-08-24 07:08:24.422203	completed	\N	\N	8
1772	003_create_special_offers.sql	2025-08-24 07:08:24.664998	started	\N	\N	0
1773	003_create_special_offers.sql	2025-08-24 07:08:24.664998	completed	\N	\N	2
1774	004_create_tour_statistics.sql	2025-08-24 07:08:24.950653	started	\N	\N	0
1775	004_create_tour_statistics.sql	2025-08-24 07:08:24.950653	completed	\N	\N	0
1776	005_create_featured_reviews.sql	2025-08-24 07:08:25.272161	started	\N	\N	0
1777	005_create_featured_reviews.sql	2025-08-24 07:08:25.272161	completed	\N	\N	5
1778	006_create_homepage_settings.sql	2025-08-24 07:08:25.699469	started	\N	\N	0
1779	006_create_homepage_settings.sql	2025-08-24 07:08:25.699469	completed	\N	\N	10
1780	007_enrich_tours_table.sql	2025-08-24 07:08:26.098195	started	\N	\N	0
1781	007_enrich_tours_table.sql	2025-08-24 07:08:26.098195	completed	\N	\N	6
1782	008_enrich_blog_posts_table.sql	2025-08-24 07:08:26.838172	started	\N	\N	0
1783	008_enrich_blog_posts_table.sql	2025-08-24 07:08:26.838172	completed	\N	\N	0
1784	009_enrich_destinations_table.sql	2025-08-24 07:08:27.488122	started	\N	\N	0
1785	009_enrich_destinations_table.sql	2025-08-24 07:08:27.488122	completed	\N	\N	6
1786	010_create_foreign_keys_constraints.sql	2025-08-24 07:08:28.413362	started	\N	\N	0
1787	010_create_foreign_keys_constraints.sql	2025-08-24 07:08:28.413362	completed	\N	\N	0
1788	011_create_performance_indexes.sql	2025-08-24 07:08:29.210677	started	\N	\N	0
1789	011_create_performance_indexes.sql	2025-08-24 07:08:29.210677	completed	\N	\N	0
1790	012_create_homepage_views.sql	2025-08-24 07:08:30.146643	started	\N	\N	0
1791	012_create_homepage_views.sql	2025-08-24 07:08:30.146643	completed	\N	\N	0
1792	013_create_utility_functions.sql	2025-08-24 07:08:30.878239	started	\N	\N	0
1793	013_create_utility_functions.sql	2025-08-24 07:08:30.878239	completed	\N	\N	0
2707	014_seed_database_data.sql	2025-08-24 07:58:43.887455	started	\N	\N	0
1795	001_backup_preparation.sql	2025-08-24 07:09:51.767415	completed	\N	\N	0
1796	002_create_tour_categories.sql	2025-08-24 07:09:51.82161	started	\N	\N	0
1797	002_create_tour_categories.sql	2025-08-24 07:09:51.82161	completed	\N	\N	8
1798	003_create_special_offers.sql	2025-08-24 07:09:52.201249	started	\N	\N	0
1799	003_create_special_offers.sql	2025-08-24 07:09:52.201249	completed	\N	\N	2
1800	004_create_tour_statistics.sql	2025-08-24 07:09:52.665194	started	\N	\N	0
1801	004_create_tour_statistics.sql	2025-08-24 07:09:52.665194	completed	\N	\N	0
1802	005_create_featured_reviews.sql	2025-08-24 07:09:53.088813	started	\N	\N	0
1803	005_create_featured_reviews.sql	2025-08-24 07:09:53.088813	completed	\N	\N	5
1804	006_create_homepage_settings.sql	2025-08-24 07:09:53.644626	started	\N	\N	0
1805	006_create_homepage_settings.sql	2025-08-24 07:09:53.644626	completed	\N	\N	10
1806	007_enrich_tours_table.sql	2025-08-24 07:09:54.176259	started	\N	\N	0
1807	007_enrich_tours_table.sql	2025-08-24 07:09:54.176259	completed	\N	\N	6
1808	008_enrich_blog_posts_table.sql	2025-08-24 07:09:54.888417	started	\N	\N	0
1809	008_enrich_blog_posts_table.sql	2025-08-24 07:09:54.888417	completed	\N	\N	0
1810	009_enrich_destinations_table.sql	2025-08-24 07:09:55.527724	started	\N	\N	0
1811	009_enrich_destinations_table.sql	2025-08-24 07:09:55.527724	completed	\N	\N	6
1812	010_create_foreign_keys_constraints.sql	2025-08-24 07:09:56.473473	started	\N	\N	0
1813	010_create_foreign_keys_constraints.sql	2025-08-24 07:09:56.473473	completed	\N	\N	0
1814	011_create_performance_indexes.sql	2025-08-24 07:09:57.311472	started	\N	\N	0
1815	011_create_performance_indexes.sql	2025-08-24 07:09:57.311472	completed	\N	\N	0
1816	012_create_homepage_views.sql	2025-08-24 07:09:58.188155	started	\N	\N	0
1817	012_create_homepage_views.sql	2025-08-24 07:09:58.188155	completed	\N	\N	0
1818	013_create_utility_functions.sql	2025-08-24 07:09:58.932478	started	\N	\N	0
1819	013_create_utility_functions.sql	2025-08-24 07:09:58.932478	completed	\N	\N	0
2708	014_seed_database_data.sql	2025-08-24 07:58:43.887455	completed	\N	\N	75
1821	001_backup_preparation.sql	2025-08-24 07:13:16.513763	completed	\N	\N	0
1822	002_create_tour_categories.sql	2025-08-24 07:13:16.56584	started	\N	\N	0
1823	002_create_tour_categories.sql	2025-08-24 07:13:16.56584	completed	\N	\N	8
1824	003_create_special_offers.sql	2025-08-24 07:13:16.850118	started	\N	\N	0
1825	003_create_special_offers.sql	2025-08-24 07:13:16.850118	completed	\N	\N	2
1826	004_create_tour_statistics.sql	2025-08-24 07:13:17.225354	started	\N	\N	0
1827	004_create_tour_statistics.sql	2025-08-24 07:13:17.225354	completed	\N	\N	0
1828	005_create_featured_reviews.sql	2025-08-24 07:13:17.559347	started	\N	\N	0
1829	005_create_featured_reviews.sql	2025-08-24 07:13:17.559347	completed	\N	\N	5
1830	006_create_homepage_settings.sql	2025-08-24 07:13:17.99574	started	\N	\N	0
1831	006_create_homepage_settings.sql	2025-08-24 07:13:17.99574	completed	\N	\N	10
1832	007_enrich_tours_table.sql	2025-08-24 07:13:18.415641	started	\N	\N	0
1833	007_enrich_tours_table.sql	2025-08-24 07:13:18.415641	completed	\N	\N	6
1834	008_enrich_blog_posts_table.sql	2025-08-24 07:13:19.153867	started	\N	\N	0
1835	008_enrich_blog_posts_table.sql	2025-08-24 07:13:19.153867	completed	\N	\N	0
1836	009_enrich_destinations_table.sql	2025-08-24 07:13:19.822634	started	\N	\N	0
1837	009_enrich_destinations_table.sql	2025-08-24 07:13:19.822634	completed	\N	\N	6
1838	010_create_foreign_keys_constraints.sql	2025-08-24 07:13:20.807841	started	\N	\N	0
1839	010_create_foreign_keys_constraints.sql	2025-08-24 07:13:20.807841	completed	\N	\N	0
1840	011_create_performance_indexes.sql	2025-08-24 07:13:21.600615	started	\N	\N	0
1841	011_create_performance_indexes.sql	2025-08-24 07:13:21.600615	completed	\N	\N	0
1842	012_create_homepage_views.sql	2025-08-24 07:13:22.340164	started	\N	\N	0
1843	012_create_homepage_views.sql	2025-08-24 07:13:22.340164	completed	\N	\N	0
1844	013_create_utility_functions.sql	2025-08-24 07:13:23.167123	started	\N	\N	0
1845	013_create_utility_functions.sql	2025-08-24 07:13:23.167123	completed	\N	\N	0
2709	015_database_integrity_tests.sql	2025-08-24 07:58:44.870561	started	\N	\N	0
1847	001_backup_preparation.sql	2025-08-24 07:21:11.235988	completed	\N	\N	0
1848	002_create_tour_categories.sql	2025-08-24 07:21:11.30978	started	\N	\N	0
1849	002_create_tour_categories.sql	2025-08-24 07:21:11.30978	completed	\N	\N	8
1850	003_create_special_offers.sql	2025-08-24 07:21:11.566271	started	\N	\N	0
1851	003_create_special_offers.sql	2025-08-24 07:21:11.566271	completed	\N	\N	2
1852	004_create_tour_statistics.sql	2025-08-24 07:21:11.87456	started	\N	\N	0
1853	004_create_tour_statistics.sql	2025-08-24 07:21:11.87456	completed	\N	\N	0
1854	005_create_featured_reviews.sql	2025-08-24 07:21:12.248457	started	\N	\N	0
1855	005_create_featured_reviews.sql	2025-08-24 07:21:12.248457	completed	\N	\N	5
1856	006_create_homepage_settings.sql	2025-08-24 07:21:12.694685	started	\N	\N	0
1857	006_create_homepage_settings.sql	2025-08-24 07:21:12.694685	completed	\N	\N	10
1858	007_enrich_tours_table.sql	2025-08-24 07:21:13.126671	started	\N	\N	0
1859	007_enrich_tours_table.sql	2025-08-24 07:21:13.126671	completed	\N	\N	6
1860	008_enrich_blog_posts_table.sql	2025-08-24 07:21:13.853715	started	\N	\N	0
1861	008_enrich_blog_posts_table.sql	2025-08-24 07:21:13.853715	completed	\N	\N	0
1862	009_enrich_destinations_table.sql	2025-08-24 07:21:14.551979	started	\N	\N	0
1863	009_enrich_destinations_table.sql	2025-08-24 07:21:14.551979	completed	\N	\N	6
1864	010_create_foreign_keys_constraints.sql	2025-08-24 07:21:15.569449	started	\N	\N	0
1865	010_create_foreign_keys_constraints.sql	2025-08-24 07:21:15.569449	completed	\N	\N	0
1866	011_create_performance_indexes.sql	2025-08-24 07:21:16.396049	started	\N	\N	0
1867	011_create_performance_indexes.sql	2025-08-24 07:21:16.396049	completed	\N	\N	0
1868	012_create_homepage_views.sql	2025-08-24 07:21:17.300885	started	\N	\N	0
1869	012_create_homepage_views.sql	2025-08-24 07:21:17.300885	completed	\N	\N	0
1870	013_create_utility_functions.sql	2025-08-24 07:21:18.120386	started	\N	\N	0
1871	013_create_utility_functions.sql	2025-08-24 07:21:18.120386	completed	\N	\N	0
2710	015_database_integrity_tests.sql	2025-08-24 07:58:44.870561	completed	\N	\N	29
1873	001_backup_preparation.sql	2025-08-24 07:22:26.640483	completed	\N	\N	0
1874	002_create_tour_categories.sql	2025-08-24 07:22:26.716156	started	\N	\N	0
1875	002_create_tour_categories.sql	2025-08-24 07:22:26.716156	completed	\N	\N	8
1876	003_create_special_offers.sql	2025-08-24 07:22:26.956807	started	\N	\N	0
1877	003_create_special_offers.sql	2025-08-24 07:22:26.956807	completed	\N	\N	2
1878	004_create_tour_statistics.sql	2025-08-24 07:22:27.253598	started	\N	\N	0
1879	004_create_tour_statistics.sql	2025-08-24 07:22:27.253598	completed	\N	\N	0
1880	005_create_featured_reviews.sql	2025-08-24 07:22:27.658893	started	\N	\N	0
1881	005_create_featured_reviews.sql	2025-08-24 07:22:27.658893	completed	\N	\N	5
1882	006_create_homepage_settings.sql	2025-08-24 07:22:28.09349	started	\N	\N	0
1883	006_create_homepage_settings.sql	2025-08-24 07:22:28.09349	completed	\N	\N	10
1884	007_enrich_tours_table.sql	2025-08-24 07:22:28.549337	started	\N	\N	0
1885	007_enrich_tours_table.sql	2025-08-24 07:22:28.549337	completed	\N	\N	6
1886	008_enrich_blog_posts_table.sql	2025-08-24 07:22:29.183228	started	\N	\N	0
1887	008_enrich_blog_posts_table.sql	2025-08-24 07:22:29.183228	completed	\N	\N	0
1888	009_enrich_destinations_table.sql	2025-08-24 07:22:29.854444	started	\N	\N	0
1889	009_enrich_destinations_table.sql	2025-08-24 07:22:29.854444	completed	\N	\N	6
1890	010_create_foreign_keys_constraints.sql	2025-08-24 07:22:30.930649	started	\N	\N	0
1891	010_create_foreign_keys_constraints.sql	2025-08-24 07:22:30.930649	completed	\N	\N	0
1892	011_create_performance_indexes.sql	2025-08-24 07:22:31.772465	started	\N	\N	0
1893	011_create_performance_indexes.sql	2025-08-24 07:22:31.772465	completed	\N	\N	0
1894	012_create_homepage_views.sql	2025-08-24 07:22:32.545375	started	\N	\N	0
1895	012_create_homepage_views.sql	2025-08-24 07:22:32.545375	completed	\N	\N	0
1896	013_create_utility_functions.sql	2025-08-24 07:22:33.387798	started	\N	\N	0
1897	013_create_utility_functions.sql	2025-08-24 07:22:33.387798	completed	\N	\N	0
2740	001_backup_preparation.sql	2025-08-24 08:00:19.537265	completed	\N	\N	0
1899	001_backup_preparation.sql	2025-08-24 07:23:08.871386	completed	\N	\N	0
1900	002_create_tour_categories.sql	2025-08-24 07:23:08.940916	started	\N	\N	0
1901	002_create_tour_categories.sql	2025-08-24 07:23:08.940916	completed	\N	\N	8
1902	003_create_special_offers.sql	2025-08-24 07:23:09.178645	started	\N	\N	0
1903	003_create_special_offers.sql	2025-08-24 07:23:09.178645	completed	\N	\N	2
1904	004_create_tour_statistics.sql	2025-08-24 07:23:09.551917	started	\N	\N	0
1905	004_create_tour_statistics.sql	2025-08-24 07:23:09.551917	completed	\N	\N	0
1906	005_create_featured_reviews.sql	2025-08-24 07:23:09.887556	started	\N	\N	0
1907	005_create_featured_reviews.sql	2025-08-24 07:23:09.887556	completed	\N	\N	5
1908	006_create_homepage_settings.sql	2025-08-24 07:23:10.327328	started	\N	\N	0
1909	006_create_homepage_settings.sql	2025-08-24 07:23:10.327328	completed	\N	\N	10
1910	007_enrich_tours_table.sql	2025-08-24 07:23:10.76705	started	\N	\N	0
1911	007_enrich_tours_table.sql	2025-08-24 07:23:10.76705	completed	\N	\N	6
1912	008_enrich_blog_posts_table.sql	2025-08-24 07:23:11.435363	started	\N	\N	0
1913	008_enrich_blog_posts_table.sql	2025-08-24 07:23:11.435363	completed	\N	\N	0
1914	009_enrich_destinations_table.sql	2025-08-24 07:23:12.096067	started	\N	\N	0
1915	009_enrich_destinations_table.sql	2025-08-24 07:23:12.096067	completed	\N	\N	6
1916	010_create_foreign_keys_constraints.sql	2025-08-24 07:23:13.159056	started	\N	\N	0
1917	010_create_foreign_keys_constraints.sql	2025-08-24 07:23:13.159056	completed	\N	\N	0
1918	011_create_performance_indexes.sql	2025-08-24 07:23:13.983987	started	\N	\N	0
1919	011_create_performance_indexes.sql	2025-08-24 07:23:13.983987	completed	\N	\N	0
1920	012_create_homepage_views.sql	2025-08-24 07:23:14.773836	started	\N	\N	0
1921	012_create_homepage_views.sql	2025-08-24 07:23:14.773836	completed	\N	\N	0
1922	013_create_utility_functions.sql	2025-08-24 07:23:15.568724	started	\N	\N	0
1923	013_create_utility_functions.sql	2025-08-24 07:23:15.568724	completed	\N	\N	0
1925	001_backup_preparation.sql	2025-08-24 07:23:59.306221	completed	\N	\N	0
1926	002_create_tour_categories.sql	2025-08-24 07:23:59.379776	started	\N	\N	0
1927	002_create_tour_categories.sql	2025-08-24 07:23:59.379776	completed	\N	\N	8
1928	003_create_special_offers.sql	2025-08-24 07:23:59.645518	started	\N	\N	0
1929	003_create_special_offers.sql	2025-08-24 07:23:59.645518	completed	\N	\N	2
1930	004_create_tour_statistics.sql	2025-08-24 07:23:59.930727	started	\N	\N	0
1931	004_create_tour_statistics.sql	2025-08-24 07:23:59.930727	completed	\N	\N	0
1932	005_create_featured_reviews.sql	2025-08-24 07:24:00.26261	started	\N	\N	0
1933	005_create_featured_reviews.sql	2025-08-24 07:24:00.26261	completed	\N	\N	5
1934	006_create_homepage_settings.sql	2025-08-24 07:24:00.725087	started	\N	\N	0
1935	006_create_homepage_settings.sql	2025-08-24 07:24:00.725087	completed	\N	\N	10
1936	007_enrich_tours_table.sql	2025-08-24 07:24:01.146756	started	\N	\N	0
1937	007_enrich_tours_table.sql	2025-08-24 07:24:01.146756	completed	\N	\N	6
1938	008_enrich_blog_posts_table.sql	2025-08-24 07:24:01.854073	started	\N	\N	0
1939	008_enrich_blog_posts_table.sql	2025-08-24 07:24:01.854073	completed	\N	\N	0
1940	009_enrich_destinations_table.sql	2025-08-24 07:24:02.547651	started	\N	\N	0
1941	009_enrich_destinations_table.sql	2025-08-24 07:24:02.547651	completed	\N	\N	6
1942	010_create_foreign_keys_constraints.sql	2025-08-24 07:24:03.599117	started	\N	\N	0
1943	010_create_foreign_keys_constraints.sql	2025-08-24 07:24:03.599117	completed	\N	\N	0
1944	011_create_performance_indexes.sql	2025-08-24 07:24:04.393021	started	\N	\N	0
1945	011_create_performance_indexes.sql	2025-08-24 07:24:04.393021	completed	\N	\N	0
1946	012_create_homepage_views.sql	2025-08-24 07:24:05.233706	started	\N	\N	0
1947	012_create_homepage_views.sql	2025-08-24 07:24:05.233706	completed	\N	\N	0
1948	013_create_utility_functions.sql	2025-08-24 07:24:06.0065	started	\N	\N	0
1949	013_create_utility_functions.sql	2025-08-24 07:24:06.0065	completed	\N	\N	0
2711	001_backup_preparation.sql	2025-08-24 07:59:20.754963	completed	\N	\N	0
1951	001_backup_preparation.sql	2025-08-24 07:24:58.540844	completed	\N	\N	0
1952	002_create_tour_categories.sql	2025-08-24 07:24:58.591261	started	\N	\N	0
1953	002_create_tour_categories.sql	2025-08-24 07:24:58.591261	completed	\N	\N	8
1954	003_create_special_offers.sql	2025-08-24 07:24:58.914573	started	\N	\N	0
1955	003_create_special_offers.sql	2025-08-24 07:24:58.914573	completed	\N	\N	2
1956	004_create_tour_statistics.sql	2025-08-24 07:24:59.269072	started	\N	\N	0
1957	004_create_tour_statistics.sql	2025-08-24 07:24:59.269072	completed	\N	\N	0
1958	005_create_featured_reviews.sql	2025-08-24 07:24:59.651599	started	\N	\N	0
1959	005_create_featured_reviews.sql	2025-08-24 07:24:59.651599	completed	\N	\N	5
1960	006_create_homepage_settings.sql	2025-08-24 07:25:00.159812	started	\N	\N	0
1961	006_create_homepage_settings.sql	2025-08-24 07:25:00.159812	completed	\N	\N	10
1962	007_enrich_tours_table.sql	2025-08-24 07:25:00.623968	started	\N	\N	0
1963	007_enrich_tours_table.sql	2025-08-24 07:25:00.623968	completed	\N	\N	6
1964	008_enrich_blog_posts_table.sql	2025-08-24 07:25:01.336714	started	\N	\N	0
1965	008_enrich_blog_posts_table.sql	2025-08-24 07:25:01.336714	completed	\N	\N	0
1966	009_enrich_destinations_table.sql	2025-08-24 07:25:02.055293	started	\N	\N	0
1967	009_enrich_destinations_table.sql	2025-08-24 07:25:02.055293	completed	\N	\N	6
1968	010_create_foreign_keys_constraints.sql	2025-08-24 07:25:03.031933	started	\N	\N	0
1969	010_create_foreign_keys_constraints.sql	2025-08-24 07:25:03.031933	completed	\N	\N	0
1970	011_create_performance_indexes.sql	2025-08-24 07:25:03.86331	started	\N	\N	0
1971	011_create_performance_indexes.sql	2025-08-24 07:25:03.86331	completed	\N	\N	0
1972	012_create_homepage_views.sql	2025-08-24 07:25:04.731593	started	\N	\N	0
1973	012_create_homepage_views.sql	2025-08-24 07:25:04.731593	completed	\N	\N	0
1974	013_create_utility_functions.sql	2025-08-24 07:25:05.501987	started	\N	\N	0
1975	013_create_utility_functions.sql	2025-08-24 07:25:05.501987	completed	\N	\N	0
2712	002_create_tour_categories.sql	2025-08-24 07:59:20.800573	started	\N	\N	0
1977	001_backup_preparation.sql	2025-08-24 07:26:56.650925	completed	\N	\N	0
1978	002_create_tour_categories.sql	2025-08-24 07:26:56.699716	started	\N	\N	0
1979	002_create_tour_categories.sql	2025-08-24 07:26:56.699716	completed	\N	\N	8
1980	003_create_special_offers.sql	2025-08-24 07:26:56.947709	started	\N	\N	0
1981	003_create_special_offers.sql	2025-08-24 07:26:56.947709	completed	\N	\N	2
1982	004_create_tour_statistics.sql	2025-08-24 07:26:57.272139	started	\N	\N	0
1983	004_create_tour_statistics.sql	2025-08-24 07:26:57.272139	completed	\N	\N	0
1984	005_create_featured_reviews.sql	2025-08-24 07:26:57.604291	started	\N	\N	0
1985	005_create_featured_reviews.sql	2025-08-24 07:26:57.604291	completed	\N	\N	5
1986	006_create_homepage_settings.sql	2025-08-24 07:26:58.065019	started	\N	\N	0
1987	006_create_homepage_settings.sql	2025-08-24 07:26:58.065019	completed	\N	\N	10
1988	007_enrich_tours_table.sql	2025-08-24 07:26:58.490398	started	\N	\N	0
1989	007_enrich_tours_table.sql	2025-08-24 07:26:58.490398	completed	\N	\N	6
1990	008_enrich_blog_posts_table.sql	2025-08-24 07:26:59.111672	started	\N	\N	0
1991	008_enrich_blog_posts_table.sql	2025-08-24 07:26:59.111672	completed	\N	\N	0
1992	009_enrich_destinations_table.sql	2025-08-24 07:26:59.830718	started	\N	\N	0
1993	009_enrich_destinations_table.sql	2025-08-24 07:26:59.830718	completed	\N	\N	6
1994	010_create_foreign_keys_constraints.sql	2025-08-24 07:27:00.91393	started	\N	\N	0
1995	010_create_foreign_keys_constraints.sql	2025-08-24 07:27:00.91393	completed	\N	\N	0
1996	011_create_performance_indexes.sql	2025-08-24 07:27:01.726611	started	\N	\N	0
1997	011_create_performance_indexes.sql	2025-08-24 07:27:01.726611	completed	\N	\N	0
1998	012_create_homepage_views.sql	2025-08-24 07:27:02.523158	started	\N	\N	0
1999	012_create_homepage_views.sql	2025-08-24 07:27:02.523158	completed	\N	\N	0
2000	013_create_utility_functions.sql	2025-08-24 07:27:03.400182	started	\N	\N	0
2001	013_create_utility_functions.sql	2025-08-24 07:27:03.400182	completed	\N	\N	0
2713	002_create_tour_categories.sql	2025-08-24 07:59:20.800573	completed	\N	\N	8
2003	001_backup_preparation.sql	2025-08-24 07:28:08.36854	completed	\N	\N	0
2004	002_create_tour_categories.sql	2025-08-24 07:28:08.417032	started	\N	\N	0
2005	002_create_tour_categories.sql	2025-08-24 07:28:08.417032	completed	\N	\N	8
2006	003_create_special_offers.sql	2025-08-24 07:28:08.695064	started	\N	\N	0
2007	003_create_special_offers.sql	2025-08-24 07:28:08.695064	completed	\N	\N	2
2008	004_create_tour_statistics.sql	2025-08-24 07:28:09.007753	started	\N	\N	0
2009	004_create_tour_statistics.sql	2025-08-24 07:28:09.007753	completed	\N	\N	0
2010	005_create_featured_reviews.sql	2025-08-24 07:28:09.36206	started	\N	\N	0
2011	005_create_featured_reviews.sql	2025-08-24 07:28:09.36206	completed	\N	\N	5
2012	006_create_homepage_settings.sql	2025-08-24 07:28:09.934687	started	\N	\N	0
2013	006_create_homepage_settings.sql	2025-08-24 07:28:09.934687	completed	\N	\N	10
2014	007_enrich_tours_table.sql	2025-08-24 07:28:10.357239	started	\N	\N	0
2015	007_enrich_tours_table.sql	2025-08-24 07:28:10.357239	completed	\N	\N	6
2016	008_enrich_blog_posts_table.sql	2025-08-24 07:28:10.992081	started	\N	\N	0
2017	008_enrich_blog_posts_table.sql	2025-08-24 07:28:10.992081	completed	\N	\N	0
2018	009_enrich_destinations_table.sql	2025-08-24 07:28:11.708629	started	\N	\N	0
2019	009_enrich_destinations_table.sql	2025-08-24 07:28:11.708629	completed	\N	\N	6
2020	010_create_foreign_keys_constraints.sql	2025-08-24 07:28:12.722599	started	\N	\N	0
2021	010_create_foreign_keys_constraints.sql	2025-08-24 07:28:12.722599	completed	\N	\N	0
2022	011_create_performance_indexes.sql	2025-08-24 07:28:13.649167	started	\N	\N	0
2023	011_create_performance_indexes.sql	2025-08-24 07:28:13.649167	completed	\N	\N	0
2024	012_create_homepage_views.sql	2025-08-24 07:28:14.437426	started	\N	\N	0
2025	012_create_homepage_views.sql	2025-08-24 07:28:14.437426	completed	\N	\N	0
2026	013_create_utility_functions.sql	2025-08-24 07:28:15.208895	started	\N	\N	0
2027	013_create_utility_functions.sql	2025-08-24 07:28:15.208895	completed	\N	\N	0
2714	003_create_special_offers.sql	2025-08-24 07:59:21.056283	started	\N	\N	0
2029	001_backup_preparation.sql	2025-08-24 07:29:35.858337	completed	\N	\N	0
2030	002_create_tour_categories.sql	2025-08-24 07:29:35.928619	started	\N	\N	0
2031	002_create_tour_categories.sql	2025-08-24 07:29:35.928619	completed	\N	\N	8
2032	003_create_special_offers.sql	2025-08-24 07:29:36.182608	started	\N	\N	0
2033	003_create_special_offers.sql	2025-08-24 07:29:36.182608	completed	\N	\N	2
2034	004_create_tour_statistics.sql	2025-08-24 07:29:36.510039	started	\N	\N	0
2035	004_create_tour_statistics.sql	2025-08-24 07:29:36.510039	completed	\N	\N	0
2036	005_create_featured_reviews.sql	2025-08-24 07:29:36.853594	started	\N	\N	0
2037	005_create_featured_reviews.sql	2025-08-24 07:29:36.853594	completed	\N	\N	5
2038	006_create_homepage_settings.sql	2025-08-24 07:29:37.377532	started	\N	\N	0
2039	006_create_homepage_settings.sql	2025-08-24 07:29:37.377532	completed	\N	\N	10
2040	007_enrich_tours_table.sql	2025-08-24 07:29:37.799482	started	\N	\N	0
2041	007_enrich_tours_table.sql	2025-08-24 07:29:37.799482	completed	\N	\N	6
2042	008_enrich_blog_posts_table.sql	2025-08-24 07:29:38.466655	started	\N	\N	0
2043	008_enrich_blog_posts_table.sql	2025-08-24 07:29:38.466655	completed	\N	\N	0
2044	009_enrich_destinations_table.sql	2025-08-24 07:29:39.170855	started	\N	\N	0
2045	009_enrich_destinations_table.sql	2025-08-24 07:29:39.170855	completed	\N	\N	6
2046	010_create_foreign_keys_constraints.sql	2025-08-24 07:29:40.175047	started	\N	\N	0
2047	010_create_foreign_keys_constraints.sql	2025-08-24 07:29:40.175047	completed	\N	\N	0
2048	011_create_performance_indexes.sql	2025-08-24 07:29:41.096517	started	\N	\N	0
2049	011_create_performance_indexes.sql	2025-08-24 07:29:41.096517	completed	\N	\N	0
2050	012_create_homepage_views.sql	2025-08-24 07:29:41.909799	started	\N	\N	0
2051	012_create_homepage_views.sql	2025-08-24 07:29:41.909799	completed	\N	\N	0
2052	013_create_utility_functions.sql	2025-08-24 07:29:42.643755	started	\N	\N	0
2053	013_create_utility_functions.sql	2025-08-24 07:29:42.643755	completed	\N	\N	0
2715	003_create_special_offers.sql	2025-08-24 07:59:21.056283	completed	\N	\N	2
2055	001_backup_preparation.sql	2025-08-24 07:31:34.318509	completed	\N	\N	0
2056	002_create_tour_categories.sql	2025-08-24 07:31:34.390893	started	\N	\N	0
2057	002_create_tour_categories.sql	2025-08-24 07:31:34.390893	completed	\N	\N	8
2058	003_create_special_offers.sql	2025-08-24 07:31:34.636436	started	\N	\N	0
2059	003_create_special_offers.sql	2025-08-24 07:31:34.636436	completed	\N	\N	2
2060	004_create_tour_statistics.sql	2025-08-24 07:31:34.926878	started	\N	\N	0
2061	004_create_tour_statistics.sql	2025-08-24 07:31:34.926878	completed	\N	\N	0
2062	005_create_featured_reviews.sql	2025-08-24 07:31:35.276643	started	\N	\N	0
2063	005_create_featured_reviews.sql	2025-08-24 07:31:35.276643	completed	\N	\N	5
2064	006_create_homepage_settings.sql	2025-08-24 07:31:35.714382	started	\N	\N	0
2065	006_create_homepage_settings.sql	2025-08-24 07:31:35.714382	completed	\N	\N	10
2066	007_enrich_tours_table.sql	2025-08-24 07:31:36.135529	started	\N	\N	0
2067	007_enrich_tours_table.sql	2025-08-24 07:31:36.135529	completed	\N	\N	6
2068	008_enrich_blog_posts_table.sql	2025-08-24 07:31:36.770566	started	\N	\N	0
2069	008_enrich_blog_posts_table.sql	2025-08-24 07:31:36.770566	completed	\N	\N	0
2070	009_enrich_destinations_table.sql	2025-08-24 07:31:37.4764	started	\N	\N	0
2071	009_enrich_destinations_table.sql	2025-08-24 07:31:37.4764	completed	\N	\N	6
2072	010_create_foreign_keys_constraints.sql	2025-08-24 07:31:38.54278	started	\N	\N	0
2073	010_create_foreign_keys_constraints.sql	2025-08-24 07:31:38.54278	completed	\N	\N	0
2074	011_create_performance_indexes.sql	2025-08-24 07:31:39.352748	started	\N	\N	0
2075	011_create_performance_indexes.sql	2025-08-24 07:31:39.352748	completed	\N	\N	0
2076	012_create_homepage_views.sql	2025-08-24 07:31:40.153423	started	\N	\N	0
2077	012_create_homepage_views.sql	2025-08-24 07:31:40.153423	completed	\N	\N	0
2078	013_create_utility_functions.sql	2025-08-24 07:31:40.960268	started	\N	\N	0
2079	013_create_utility_functions.sql	2025-08-24 07:31:40.960268	completed	\N	\N	0
2080	014_seed_database_data.sql	2025-08-24 07:31:41.594133	started	\N	\N	0
2081	014_seed_database_data.sql	2025-08-24 07:31:41.594133	completed	\N	\N	75
2716	004_create_tour_statistics.sql	2025-08-24 07:59:21.395376	started	\N	\N	0
2083	001_backup_preparation.sql	2025-08-24 07:32:16.441437	completed	\N	\N	0
2084	002_create_tour_categories.sql	2025-08-24 07:32:16.492612	started	\N	\N	0
2085	002_create_tour_categories.sql	2025-08-24 07:32:16.492612	completed	\N	\N	8
2086	003_create_special_offers.sql	2025-08-24 07:32:16.847725	started	\N	\N	0
2087	003_create_special_offers.sql	2025-08-24 07:32:16.847725	completed	\N	\N	2
2088	004_create_tour_statistics.sql	2025-08-24 07:32:17.359315	started	\N	\N	0
2089	004_create_tour_statistics.sql	2025-08-24 07:32:17.359315	completed	\N	\N	0
2090	005_create_featured_reviews.sql	2025-08-24 07:32:17.97142	started	\N	\N	0
2091	005_create_featured_reviews.sql	2025-08-24 07:32:17.97142	completed	\N	\N	5
2092	006_create_homepage_settings.sql	2025-08-24 07:32:18.57753	started	\N	\N	0
2093	006_create_homepage_settings.sql	2025-08-24 07:32:18.57753	completed	\N	\N	10
2094	007_enrich_tours_table.sql	2025-08-24 07:32:19.067313	started	\N	\N	0
2095	007_enrich_tours_table.sql	2025-08-24 07:32:19.067313	completed	\N	\N	11
2096	008_enrich_blog_posts_table.sql	2025-08-24 07:32:19.700807	started	\N	\N	0
2097	008_enrich_blog_posts_table.sql	2025-08-24 07:32:19.700807	completed	\N	\N	4
2098	009_enrich_destinations_table.sql	2025-08-24 07:32:20.380164	started	\N	\N	0
2099	009_enrich_destinations_table.sql	2025-08-24 07:32:20.380164	completed	\N	\N	13
2717	004_create_tour_statistics.sql	2025-08-24 07:59:21.395376	completed	\N	\N	0
2101	001_backup_preparation.sql	2025-08-24 07:34:17.658191	completed	\N	\N	0
2102	002_create_tour_categories.sql	2025-08-24 07:34:17.698311	started	\N	\N	0
2103	002_create_tour_categories.sql	2025-08-24 07:34:17.698311	completed	\N	\N	8
2104	003_create_special_offers.sql	2025-08-24 07:34:17.941172	started	\N	\N	0
2105	003_create_special_offers.sql	2025-08-24 07:34:17.941172	completed	\N	\N	2
2106	004_create_tour_statistics.sql	2025-08-24 07:34:18.2779	started	\N	\N	0
2107	004_create_tour_statistics.sql	2025-08-24 07:34:18.2779	completed	\N	\N	0
2108	005_create_featured_reviews.sql	2025-08-24 07:34:18.591796	started	\N	\N	0
2109	005_create_featured_reviews.sql	2025-08-24 07:34:18.591796	completed	\N	\N	5
2110	006_create_homepage_settings.sql	2025-08-24 07:34:19.060743	started	\N	\N	0
2111	006_create_homepage_settings.sql	2025-08-24 07:34:19.060743	completed	\N	\N	10
2112	007_enrich_tours_table.sql	2025-08-24 07:34:19.512623	started	\N	\N	0
2113	007_enrich_tours_table.sql	2025-08-24 07:34:19.512623	completed	\N	\N	11
2114	008_enrich_blog_posts_table.sql	2025-08-24 07:34:20.152431	started	\N	\N	0
2115	008_enrich_blog_posts_table.sql	2025-08-24 07:34:20.152431	completed	\N	\N	4
2116	009_enrich_destinations_table.sql	2025-08-24 07:34:20.906282	started	\N	\N	0
2117	009_enrich_destinations_table.sql	2025-08-24 07:34:20.906282	completed	\N	\N	13
2118	010_create_foreign_keys_constraints.sql	2025-08-24 07:34:21.903936	started	\N	\N	0
2119	010_create_foreign_keys_constraints.sql	2025-08-24 07:34:21.903936	completed	\N	\N	0
2120	011_create_performance_indexes.sql	2025-08-24 07:34:22.757219	started	\N	\N	0
2121	011_create_performance_indexes.sql	2025-08-24 07:34:22.757219	completed	\N	\N	0
2122	012_create_homepage_views.sql	2025-08-24 07:34:23.529422	started	\N	\N	0
2123	012_create_homepage_views.sql	2025-08-24 07:34:23.529422	completed	\N	\N	0
2124	013_create_utility_functions.sql	2025-08-24 07:34:24.495011	started	\N	\N	0
2125	013_create_utility_functions.sql	2025-08-24 07:34:24.495011	completed	\N	\N	0
2126	014_seed_database_data.sql	2025-08-24 07:34:25.158721	started	\N	\N	0
2127	014_seed_database_data.sql	2025-08-24 07:34:25.158721	completed	\N	\N	75
2718	005_create_featured_reviews.sql	2025-08-24 07:59:21.726581	started	\N	\N	0
2129	001_backup_preparation.sql	2025-08-24 07:35:23.423538	completed	\N	\N	0
2130	002_create_tour_categories.sql	2025-08-24 07:35:23.471147	started	\N	\N	0
2131	002_create_tour_categories.sql	2025-08-24 07:35:23.471147	completed	\N	\N	8
2132	003_create_special_offers.sql	2025-08-24 07:35:23.750364	started	\N	\N	0
2133	003_create_special_offers.sql	2025-08-24 07:35:23.750364	completed	\N	\N	2
2134	004_create_tour_statistics.sql	2025-08-24 07:35:24.188172	started	\N	\N	0
2135	004_create_tour_statistics.sql	2025-08-24 07:35:24.188172	completed	\N	\N	0
2136	005_create_featured_reviews.sql	2025-08-24 07:35:24.577011	started	\N	\N	0
2137	005_create_featured_reviews.sql	2025-08-24 07:35:24.577011	completed	\N	\N	5
2138	006_create_homepage_settings.sql	2025-08-24 07:35:25.083188	started	\N	\N	0
2139	006_create_homepage_settings.sql	2025-08-24 07:35:25.083188	completed	\N	\N	10
2140	007_enrich_tours_table.sql	2025-08-24 07:35:25.52454	started	\N	\N	0
2141	007_enrich_tours_table.sql	2025-08-24 07:35:25.52454	completed	\N	\N	11
2142	008_enrich_blog_posts_table.sql	2025-08-24 07:35:26.15638	started	\N	\N	0
2143	008_enrich_blog_posts_table.sql	2025-08-24 07:35:26.15638	completed	\N	\N	4
2144	009_enrich_destinations_table.sql	2025-08-24 07:35:26.841629	started	\N	\N	0
2145	009_enrich_destinations_table.sql	2025-08-24 07:35:26.841629	completed	\N	\N	13
2146	010_create_foreign_keys_constraints.sql	2025-08-24 07:35:27.956987	started	\N	\N	0
2147	010_create_foreign_keys_constraints.sql	2025-08-24 07:35:27.956987	completed	\N	\N	0
2148	011_create_performance_indexes.sql	2025-08-24 07:35:28.75459	started	\N	\N	0
2149	011_create_performance_indexes.sql	2025-08-24 07:35:28.75459	completed	\N	\N	0
2150	012_create_homepage_views.sql	2025-08-24 07:35:29.551106	started	\N	\N	0
2151	012_create_homepage_views.sql	2025-08-24 07:35:29.551106	completed	\N	\N	0
2152	013_create_utility_functions.sql	2025-08-24 07:35:30.295561	started	\N	\N	0
2153	013_create_utility_functions.sql	2025-08-24 07:35:30.295561	completed	\N	\N	0
2154	014_seed_database_data.sql	2025-08-24 07:35:30.974937	started	\N	\N	0
2155	014_seed_database_data.sql	2025-08-24 07:35:30.974937	completed	\N	\N	75
2719	005_create_featured_reviews.sql	2025-08-24 07:59:21.726581	completed	\N	\N	5
2157	001_backup_preparation.sql	2025-08-24 07:36:15.205874	completed	\N	\N	0
2158	002_create_tour_categories.sql	2025-08-24 07:36:15.277624	started	\N	\N	0
2159	002_create_tour_categories.sql	2025-08-24 07:36:15.277624	completed	\N	\N	8
2160	003_create_special_offers.sql	2025-08-24 07:36:15.532814	started	\N	\N	0
2161	003_create_special_offers.sql	2025-08-24 07:36:15.532814	completed	\N	\N	2
2162	004_create_tour_statistics.sql	2025-08-24 07:36:15.833252	started	\N	\N	0
2163	004_create_tour_statistics.sql	2025-08-24 07:36:15.833252	completed	\N	\N	0
2164	005_create_featured_reviews.sql	2025-08-24 07:36:16.168372	started	\N	\N	0
2165	005_create_featured_reviews.sql	2025-08-24 07:36:16.168372	completed	\N	\N	5
2166	006_create_homepage_settings.sql	2025-08-24 07:36:16.615104	started	\N	\N	0
2167	006_create_homepage_settings.sql	2025-08-24 07:36:16.615104	completed	\N	\N	10
2168	007_enrich_tours_table.sql	2025-08-24 07:36:17.033723	started	\N	\N	0
2169	007_enrich_tours_table.sql	2025-08-24 07:36:17.033723	completed	\N	\N	11
2170	008_enrich_blog_posts_table.sql	2025-08-24 07:36:17.761952	started	\N	\N	0
2171	008_enrich_blog_posts_table.sql	2025-08-24 07:36:17.761952	completed	\N	\N	4
2172	009_enrich_destinations_table.sql	2025-08-24 07:36:18.419138	started	\N	\N	0
2173	009_enrich_destinations_table.sql	2025-08-24 07:36:18.419138	completed	\N	\N	13
2174	010_create_foreign_keys_constraints.sql	2025-08-24 07:36:19.37853	started	\N	\N	0
2175	010_create_foreign_keys_constraints.sql	2025-08-24 07:36:19.37853	completed	\N	\N	0
2176	011_create_performance_indexes.sql	2025-08-24 07:36:20.223299	started	\N	\N	0
2177	011_create_performance_indexes.sql	2025-08-24 07:36:20.223299	completed	\N	\N	0
2178	012_create_homepage_views.sql	2025-08-24 07:36:21.093053	started	\N	\N	0
2179	012_create_homepage_views.sql	2025-08-24 07:36:21.093053	completed	\N	\N	0
2180	013_create_utility_functions.sql	2025-08-24 07:36:21.827699	started	\N	\N	0
2181	013_create_utility_functions.sql	2025-08-24 07:36:21.827699	completed	\N	\N	0
2182	014_seed_database_data.sql	2025-08-24 07:36:22.57515	started	\N	\N	0
2183	014_seed_database_data.sql	2025-08-24 07:36:22.57515	completed	\N	\N	75
2720	006_create_homepage_settings.sql	2025-08-24 07:59:22.188651	started	\N	\N	0
2185	001_backup_preparation.sql	2025-08-24 07:37:12.158869	completed	\N	\N	0
2186	002_create_tour_categories.sql	2025-08-24 07:37:12.234905	started	\N	\N	0
2187	002_create_tour_categories.sql	2025-08-24 07:37:12.234905	completed	\N	\N	8
2188	003_create_special_offers.sql	2025-08-24 07:37:12.483078	started	\N	\N	0
2189	003_create_special_offers.sql	2025-08-24 07:37:12.483078	completed	\N	\N	2
2190	004_create_tour_statistics.sql	2025-08-24 07:37:12.798958	started	\N	\N	0
2191	004_create_tour_statistics.sql	2025-08-24 07:37:12.798958	completed	\N	\N	0
2192	005_create_featured_reviews.sql	2025-08-24 07:37:13.151251	started	\N	\N	0
2193	005_create_featured_reviews.sql	2025-08-24 07:37:13.151251	completed	\N	\N	5
2194	006_create_homepage_settings.sql	2025-08-24 07:37:13.595681	started	\N	\N	0
2195	006_create_homepage_settings.sql	2025-08-24 07:37:13.595681	completed	\N	\N	10
2196	007_enrich_tours_table.sql	2025-08-24 07:37:14.026998	started	\N	\N	0
2197	007_enrich_tours_table.sql	2025-08-24 07:37:14.026998	completed	\N	\N	11
2198	008_enrich_blog_posts_table.sql	2025-08-24 07:37:14.685374	started	\N	\N	0
2199	008_enrich_blog_posts_table.sql	2025-08-24 07:37:14.685374	completed	\N	\N	4
2200	009_enrich_destinations_table.sql	2025-08-24 07:37:15.418652	started	\N	\N	0
2201	009_enrich_destinations_table.sql	2025-08-24 07:37:15.418652	completed	\N	\N	13
2202	010_create_foreign_keys_constraints.sql	2025-08-24 07:37:16.363217	started	\N	\N	0
2203	010_create_foreign_keys_constraints.sql	2025-08-24 07:37:16.363217	completed	\N	\N	0
2204	011_create_performance_indexes.sql	2025-08-24 07:37:17.187176	started	\N	\N	0
2205	011_create_performance_indexes.sql	2025-08-24 07:37:17.187176	completed	\N	\N	0
2206	012_create_homepage_views.sql	2025-08-24 07:37:18.002604	started	\N	\N	0
2207	012_create_homepage_views.sql	2025-08-24 07:37:18.002604	completed	\N	\N	0
2208	013_create_utility_functions.sql	2025-08-24 07:37:18.780918	started	\N	\N	0
2209	013_create_utility_functions.sql	2025-08-24 07:37:18.780918	completed	\N	\N	0
2210	014_seed_database_data.sql	2025-08-24 07:37:19.441406	started	\N	\N	0
2211	014_seed_database_data.sql	2025-08-24 07:37:19.441406	completed	\N	\N	75
2721	006_create_homepage_settings.sql	2025-08-24 07:59:22.188651	completed	\N	\N	10
2213	001_backup_preparation.sql	2025-08-24 07:39:33.111061	completed	\N	\N	0
2214	002_create_tour_categories.sql	2025-08-24 07:39:33.153968	started	\N	\N	0
2215	002_create_tour_categories.sql	2025-08-24 07:39:33.153968	completed	\N	\N	8
2216	003_create_special_offers.sql	2025-08-24 07:39:33.575043	started	\N	\N	0
2217	003_create_special_offers.sql	2025-08-24 07:39:33.575043	completed	\N	\N	2
2218	004_create_tour_statistics.sql	2025-08-24 07:39:34.010095	started	\N	\N	0
2219	004_create_tour_statistics.sql	2025-08-24 07:39:34.010095	completed	\N	\N	0
2220	005_create_featured_reviews.sql	2025-08-24 07:39:34.425724	started	\N	\N	0
2221	005_create_featured_reviews.sql	2025-08-24 07:39:34.425724	completed	\N	\N	5
2222	006_create_homepage_settings.sql	2025-08-24 07:39:34.930055	started	\N	\N	0
2223	006_create_homepage_settings.sql	2025-08-24 07:39:34.930055	completed	\N	\N	10
2224	007_enrich_tours_table.sql	2025-08-24 07:39:35.39983	started	\N	\N	0
2225	007_enrich_tours_table.sql	2025-08-24 07:39:35.39983	completed	\N	\N	11
2226	008_enrich_blog_posts_table.sql	2025-08-24 07:39:36.022837	started	\N	\N	0
2227	008_enrich_blog_posts_table.sql	2025-08-24 07:39:36.022837	completed	\N	\N	4
2228	009_enrich_destinations_table.sql	2025-08-24 07:39:36.701214	started	\N	\N	0
2229	009_enrich_destinations_table.sql	2025-08-24 07:39:36.701214	completed	\N	\N	13
2230	010_create_foreign_keys_constraints.sql	2025-08-24 07:39:37.811047	started	\N	\N	0
2231	010_create_foreign_keys_constraints.sql	2025-08-24 07:39:37.811047	completed	\N	\N	0
2232	011_create_performance_indexes.sql	2025-08-24 07:39:38.673184	started	\N	\N	0
2233	011_create_performance_indexes.sql	2025-08-24 07:39:38.673184	completed	\N	\N	0
2234	012_create_homepage_views.sql	2025-08-24 07:39:39.481188	started	\N	\N	0
2235	012_create_homepage_views.sql	2025-08-24 07:39:39.481188	completed	\N	\N	0
2236	013_create_utility_functions.sql	2025-08-24 07:39:40.329983	started	\N	\N	0
2237	013_create_utility_functions.sql	2025-08-24 07:39:40.329983	completed	\N	\N	0
2238	014_seed_database_data.sql	2025-08-24 07:39:40.999202	started	\N	\N	0
2239	014_seed_database_data.sql	2025-08-24 07:39:40.999202	completed	\N	\N	75
2722	007_enrich_tours_table.sql	2025-08-24 07:59:22.626039	started	\N	\N	0
2241	001_backup_preparation.sql	2025-08-24 07:40:38.63304	completed	\N	\N	0
2242	002_create_tour_categories.sql	2025-08-24 07:40:38.684712	started	\N	\N	0
2243	002_create_tour_categories.sql	2025-08-24 07:40:38.684712	completed	\N	\N	8
2244	003_create_special_offers.sql	2025-08-24 07:40:38.927319	started	\N	\N	0
2245	003_create_special_offers.sql	2025-08-24 07:40:38.927319	completed	\N	\N	2
2246	004_create_tour_statistics.sql	2025-08-24 07:40:39.218345	started	\N	\N	0
2247	004_create_tour_statistics.sql	2025-08-24 07:40:39.218345	completed	\N	\N	0
2248	005_create_featured_reviews.sql	2025-08-24 07:40:39.571091	started	\N	\N	0
2249	005_create_featured_reviews.sql	2025-08-24 07:40:39.571091	completed	\N	\N	5
2250	006_create_homepage_settings.sql	2025-08-24 07:40:40.01444	started	\N	\N	0
2251	006_create_homepage_settings.sql	2025-08-24 07:40:40.01444	completed	\N	\N	10
2252	007_enrich_tours_table.sql	2025-08-24 07:40:40.485097	started	\N	\N	0
2253	007_enrich_tours_table.sql	2025-08-24 07:40:40.485097	completed	\N	\N	11
2254	008_enrich_blog_posts_table.sql	2025-08-24 07:40:41.190613	started	\N	\N	0
2255	008_enrich_blog_posts_table.sql	2025-08-24 07:40:41.190613	completed	\N	\N	4
2256	009_enrich_destinations_table.sql	2025-08-24 07:40:41.867337	started	\N	\N	0
2257	009_enrich_destinations_table.sql	2025-08-24 07:40:41.867337	completed	\N	\N	13
2258	010_create_foreign_keys_constraints.sql	2025-08-24 07:40:42.808388	started	\N	\N	0
2259	010_create_foreign_keys_constraints.sql	2025-08-24 07:40:42.808388	completed	\N	\N	0
2260	011_create_performance_indexes.sql	2025-08-24 07:40:43.668808	started	\N	\N	0
2261	011_create_performance_indexes.sql	2025-08-24 07:40:43.668808	completed	\N	\N	0
2723	007_enrich_tours_table.sql	2025-08-24 07:59:22.626039	completed	\N	\N	11
2263	001_backup_preparation.sql	2025-08-24 07:41:09.94075	completed	\N	\N	0
2264	002_create_tour_categories.sql	2025-08-24 07:41:09.990086	started	\N	\N	0
2265	002_create_tour_categories.sql	2025-08-24 07:41:09.990086	completed	\N	\N	8
2266	003_create_special_offers.sql	2025-08-24 07:41:10.215379	started	\N	\N	0
2267	003_create_special_offers.sql	2025-08-24 07:41:10.215379	completed	\N	\N	2
2268	004_create_tour_statistics.sql	2025-08-24 07:41:10.519696	started	\N	\N	0
2269	004_create_tour_statistics.sql	2025-08-24 07:41:10.519696	completed	\N	\N	0
2270	005_create_featured_reviews.sql	2025-08-24 07:41:10.861846	started	\N	\N	0
2271	005_create_featured_reviews.sql	2025-08-24 07:41:10.861846	completed	\N	\N	5
2272	006_create_homepage_settings.sql	2025-08-24 07:41:11.29661	started	\N	\N	0
2273	006_create_homepage_settings.sql	2025-08-24 07:41:11.29661	completed	\N	\N	10
2274	007_enrich_tours_table.sql	2025-08-24 07:41:11.71551	started	\N	\N	0
2275	007_enrich_tours_table.sql	2025-08-24 07:41:11.71551	completed	\N	\N	11
2276	008_enrich_blog_posts_table.sql	2025-08-24 07:41:12.456016	started	\N	\N	0
2277	008_enrich_blog_posts_table.sql	2025-08-24 07:41:12.456016	completed	\N	\N	4
2278	009_enrich_destinations_table.sql	2025-08-24 07:41:13.182847	started	\N	\N	0
2279	009_enrich_destinations_table.sql	2025-08-24 07:41:13.182847	completed	\N	\N	13
2280	010_create_foreign_keys_constraints.sql	2025-08-24 07:41:14.141785	started	\N	\N	0
2281	010_create_foreign_keys_constraints.sql	2025-08-24 07:41:14.141785	completed	\N	\N	0
2282	011_create_performance_indexes.sql	2025-08-24 07:41:14.976859	started	\N	\N	0
2283	011_create_performance_indexes.sql	2025-08-24 07:41:14.976859	completed	\N	\N	0
2284	012_create_homepage_views.sql	2025-08-24 07:41:15.836678	started	\N	\N	0
2285	012_create_homepage_views.sql	2025-08-24 07:41:15.836678	completed	\N	\N	0
2286	013_create_utility_functions.sql	2025-08-24 07:41:16.639202	started	\N	\N	0
2287	013_create_utility_functions.sql	2025-08-24 07:41:16.639202	completed	\N	\N	0
2288	014_seed_database_data.sql	2025-08-24 07:41:17.266127	started	\N	\N	0
2289	014_seed_database_data.sql	2025-08-24 07:41:17.266127	completed	\N	\N	75
2724	008_enrich_blog_posts_table.sql	2025-08-24 07:59:23.250281	started	\N	\N	0
2291	001_backup_preparation.sql	2025-08-24 07:42:32.639562	completed	\N	\N	0
2292	002_create_tour_categories.sql	2025-08-24 07:42:32.763992	started	\N	\N	0
2293	002_create_tour_categories.sql	2025-08-24 07:42:32.763992	completed	\N	\N	8
2294	003_create_special_offers.sql	2025-08-24 07:42:33.154542	started	\N	\N	0
2295	003_create_special_offers.sql	2025-08-24 07:42:33.154542	completed	\N	\N	2
2296	004_create_tour_statistics.sql	2025-08-24 07:42:33.551626	started	\N	\N	0
2297	004_create_tour_statistics.sql	2025-08-24 07:42:33.551626	completed	\N	\N	0
2298	005_create_featured_reviews.sql	2025-08-24 07:42:33.985324	started	\N	\N	0
2299	005_create_featured_reviews.sql	2025-08-24 07:42:33.985324	completed	\N	\N	5
2300	006_create_homepage_settings.sql	2025-08-24 07:42:34.55387	started	\N	\N	0
2301	006_create_homepage_settings.sql	2025-08-24 07:42:34.55387	completed	\N	\N	10
2302	007_enrich_tours_table.sql	2025-08-24 07:42:35.084231	started	\N	\N	0
2303	007_enrich_tours_table.sql	2025-08-24 07:42:35.084231	completed	\N	\N	11
2304	008_enrich_blog_posts_table.sql	2025-08-24 07:42:35.852094	started	\N	\N	0
2305	008_enrich_blog_posts_table.sql	2025-08-24 07:42:35.852094	completed	\N	\N	4
2306	009_enrich_destinations_table.sql	2025-08-24 07:42:36.761295	started	\N	\N	0
2307	009_enrich_destinations_table.sql	2025-08-24 07:42:36.761295	completed	\N	\N	13
2308	010_create_foreign_keys_constraints.sql	2025-08-24 07:42:37.960301	started	\N	\N	0
2309	010_create_foreign_keys_constraints.sql	2025-08-24 07:42:37.960301	completed	\N	\N	0
2310	011_create_performance_indexes.sql	2025-08-24 07:42:38.947156	started	\N	\N	0
2311	011_create_performance_indexes.sql	2025-08-24 07:42:38.947156	completed	\N	\N	0
2725	008_enrich_blog_posts_table.sql	2025-08-24 07:59:23.250281	completed	\N	\N	4
2313	001_backup_preparation.sql	2025-08-24 07:43:04.067209	completed	\N	\N	0
2314	002_create_tour_categories.sql	2025-08-24 07:43:04.176938	started	\N	\N	0
2315	002_create_tour_categories.sql	2025-08-24 07:43:04.176938	completed	\N	\N	8
2316	003_create_special_offers.sql	2025-08-24 07:43:04.483351	started	\N	\N	0
2317	003_create_special_offers.sql	2025-08-24 07:43:04.483351	completed	\N	\N	2
2318	004_create_tour_statistics.sql	2025-08-24 07:43:04.87101	started	\N	\N	0
2319	004_create_tour_statistics.sql	2025-08-24 07:43:04.87101	completed	\N	\N	0
2320	005_create_featured_reviews.sql	2025-08-24 07:43:05.299603	started	\N	\N	0
2321	005_create_featured_reviews.sql	2025-08-24 07:43:05.299603	completed	\N	\N	5
2322	006_create_homepage_settings.sql	2025-08-24 07:43:05.828883	started	\N	\N	0
2323	006_create_homepage_settings.sql	2025-08-24 07:43:05.828883	completed	\N	\N	10
2324	007_enrich_tours_table.sql	2025-08-24 07:43:06.352207	started	\N	\N	0
2325	007_enrich_tours_table.sql	2025-08-24 07:43:06.352207	completed	\N	\N	11
2326	008_enrich_blog_posts_table.sql	2025-08-24 07:43:07.091521	started	\N	\N	0
2327	008_enrich_blog_posts_table.sql	2025-08-24 07:43:07.091521	completed	\N	\N	4
2328	009_enrich_destinations_table.sql	2025-08-24 07:43:07.922445	started	\N	\N	0
2329	009_enrich_destinations_table.sql	2025-08-24 07:43:07.922445	completed	\N	\N	13
2330	010_create_foreign_keys_constraints.sql	2025-08-24 07:43:09.084655	started	\N	\N	0
2331	010_create_foreign_keys_constraints.sql	2025-08-24 07:43:09.084655	completed	\N	\N	0
2332	011_create_performance_indexes.sql	2025-08-24 07:43:10.100677	started	\N	\N	0
2333	011_create_performance_indexes.sql	2025-08-24 07:43:10.100677	completed	\N	\N	0
2726	009_enrich_destinations_table.sql	2025-08-24 07:59:23.958036	started	\N	\N	0
2335	001_backup_preparation.sql	2025-08-24 07:43:47.147172	completed	\N	\N	0
2336	002_create_tour_categories.sql	2025-08-24 07:43:47.292978	started	\N	\N	0
2337	002_create_tour_categories.sql	2025-08-24 07:43:47.292978	completed	\N	\N	8
2338	003_create_special_offers.sql	2025-08-24 07:43:48.230611	started	\N	\N	0
2339	003_create_special_offers.sql	2025-08-24 07:43:48.230611	completed	\N	\N	2
2340	004_create_tour_statistics.sql	2025-08-24 07:43:48.658757	started	\N	\N	0
2341	004_create_tour_statistics.sql	2025-08-24 07:43:48.658757	completed	\N	\N	0
2342	005_create_featured_reviews.sql	2025-08-24 07:43:49.106281	started	\N	\N	0
2343	005_create_featured_reviews.sql	2025-08-24 07:43:49.106281	completed	\N	\N	5
2344	006_create_homepage_settings.sql	2025-08-24 07:43:49.639596	started	\N	\N	0
2345	006_create_homepage_settings.sql	2025-08-24 07:43:49.639596	completed	\N	\N	10
2346	007_enrich_tours_table.sql	2025-08-24 07:43:50.165676	started	\N	\N	0
2347	007_enrich_tours_table.sql	2025-08-24 07:43:50.165676	completed	\N	\N	11
2348	008_enrich_blog_posts_table.sql	2025-08-24 07:43:50.929832	started	\N	\N	0
2349	008_enrich_blog_posts_table.sql	2025-08-24 07:43:50.929832	completed	\N	\N	4
2350	009_enrich_destinations_table.sql	2025-08-24 07:43:51.762888	started	\N	\N	0
2351	009_enrich_destinations_table.sql	2025-08-24 07:43:51.762888	completed	\N	\N	13
2352	010_create_foreign_keys_constraints.sql	2025-08-24 07:43:52.943599	started	\N	\N	0
2353	010_create_foreign_keys_constraints.sql	2025-08-24 07:43:52.943599	completed	\N	\N	0
2354	011_create_performance_indexes.sql	2025-08-24 07:43:54.032126	started	\N	\N	0
2355	011_create_performance_indexes.sql	2025-08-24 07:43:54.032126	completed	\N	\N	0
2727	009_enrich_destinations_table.sql	2025-08-24 07:59:23.958036	completed	\N	\N	13
2357	001_backup_preparation.sql	2025-08-24 07:46:08.780421	completed	\N	\N	0
2358	002_create_tour_categories.sql	2025-08-24 07:46:09.003351	started	\N	\N	0
2359	002_create_tour_categories.sql	2025-08-24 07:46:09.003351	completed	\N	\N	8
2360	003_create_special_offers.sql	2025-08-24 07:46:09.348973	started	\N	\N	0
2361	003_create_special_offers.sql	2025-08-24 07:46:09.348973	completed	\N	\N	2
2362	004_create_tour_statistics.sql	2025-08-24 07:46:09.701615	started	\N	\N	0
2363	004_create_tour_statistics.sql	2025-08-24 07:46:09.701615	completed	\N	\N	0
2364	005_create_featured_reviews.sql	2025-08-24 07:46:10.129301	started	\N	\N	0
2365	005_create_featured_reviews.sql	2025-08-24 07:46:10.129301	completed	\N	\N	5
2366	006_create_homepage_settings.sql	2025-08-24 07:46:10.665464	started	\N	\N	0
2367	006_create_homepage_settings.sql	2025-08-24 07:46:10.665464	completed	\N	\N	10
2368	007_enrich_tours_table.sql	2025-08-24 07:46:11.219078	started	\N	\N	0
2369	007_enrich_tours_table.sql	2025-08-24 07:46:11.219078	completed	\N	\N	11
2370	008_enrich_blog_posts_table.sql	2025-08-24 07:46:11.937868	started	\N	\N	0
2371	008_enrich_blog_posts_table.sql	2025-08-24 07:46:11.937868	completed	\N	\N	4
2372	009_enrich_destinations_table.sql	2025-08-24 07:46:12.764154	started	\N	\N	0
2373	009_enrich_destinations_table.sql	2025-08-24 07:46:12.764154	completed	\N	\N	13
2374	010_create_foreign_keys_constraints.sql	2025-08-24 07:46:13.937582	started	\N	\N	0
2375	010_create_foreign_keys_constraints.sql	2025-08-24 07:46:13.937582	completed	\N	\N	0
2376	011_create_performance_indexes.sql	2025-08-24 07:46:14.920108	started	\N	\N	0
2377	011_create_performance_indexes.sql	2025-08-24 07:46:14.920108	completed	\N	\N	0
2728	010_create_foreign_keys_constraints.sql	2025-08-24 07:59:24.927156	started	\N	\N	0
2379	001_backup_preparation.sql	2025-08-24 07:46:36.049605	completed	\N	\N	0
2380	002_create_tour_categories.sql	2025-08-24 07:46:36.092288	started	\N	\N	0
2381	002_create_tour_categories.sql	2025-08-24 07:46:36.092288	completed	\N	\N	8
2382	003_create_special_offers.sql	2025-08-24 07:46:36.379918	started	\N	\N	0
2383	003_create_special_offers.sql	2025-08-24 07:46:36.379918	completed	\N	\N	2
2384	004_create_tour_statistics.sql	2025-08-24 07:46:36.763642	started	\N	\N	0
2385	004_create_tour_statistics.sql	2025-08-24 07:46:36.763642	completed	\N	\N	0
2386	005_create_featured_reviews.sql	2025-08-24 07:46:37.146536	started	\N	\N	0
2387	005_create_featured_reviews.sql	2025-08-24 07:46:37.146536	completed	\N	\N	5
2388	006_create_homepage_settings.sql	2025-08-24 07:46:37.591168	started	\N	\N	0
2389	006_create_homepage_settings.sql	2025-08-24 07:46:37.591168	completed	\N	\N	10
2390	007_enrich_tours_table.sql	2025-08-24 07:46:38.007021	started	\N	\N	0
2391	007_enrich_tours_table.sql	2025-08-24 07:46:38.007021	completed	\N	\N	11
2392	008_enrich_blog_posts_table.sql	2025-08-24 07:46:38.664445	started	\N	\N	0
2393	008_enrich_blog_posts_table.sql	2025-08-24 07:46:38.664445	completed	\N	\N	4
2394	009_enrich_destinations_table.sql	2025-08-24 07:46:39.359384	started	\N	\N	0
2395	009_enrich_destinations_table.sql	2025-08-24 07:46:39.359384	completed	\N	\N	13
2396	010_create_foreign_keys_constraints.sql	2025-08-24 07:46:40.367509	started	\N	\N	0
2397	010_create_foreign_keys_constraints.sql	2025-08-24 07:46:40.367509	completed	\N	\N	0
2398	011_create_performance_indexes.sql	2025-08-24 07:46:41.174979	started	\N	\N	0
2399	011_create_performance_indexes.sql	2025-08-24 07:46:41.174979	completed	\N	\N	0
2729	010_create_foreign_keys_constraints.sql	2025-08-24 07:59:24.927156	completed	\N	\N	0
2401	001_backup_preparation.sql	2025-08-24 07:47:28.747552	completed	\N	\N	0
2402	002_create_tour_categories.sql	2025-08-24 07:47:28.815894	started	\N	\N	0
2403	002_create_tour_categories.sql	2025-08-24 07:47:28.815894	completed	\N	\N	8
2404	003_create_special_offers.sql	2025-08-24 07:47:29.052235	started	\N	\N	0
2405	003_create_special_offers.sql	2025-08-24 07:47:29.052235	completed	\N	\N	2
2406	004_create_tour_statistics.sql	2025-08-24 07:47:29.345194	started	\N	\N	0
2407	004_create_tour_statistics.sql	2025-08-24 07:47:29.345194	completed	\N	\N	0
2408	005_create_featured_reviews.sql	2025-08-24 07:47:29.688151	started	\N	\N	0
2409	005_create_featured_reviews.sql	2025-08-24 07:47:29.688151	completed	\N	\N	5
2410	006_create_homepage_settings.sql	2025-08-24 07:47:30.133997	started	\N	\N	0
2411	006_create_homepage_settings.sql	2025-08-24 07:47:30.133997	completed	\N	\N	10
2412	007_enrich_tours_table.sql	2025-08-24 07:47:30.663433	started	\N	\N	0
2413	007_enrich_tours_table.sql	2025-08-24 07:47:30.663433	completed	\N	\N	11
2414	008_enrich_blog_posts_table.sql	2025-08-24 07:47:31.308276	started	\N	\N	0
2415	008_enrich_blog_posts_table.sql	2025-08-24 07:47:31.308276	completed	\N	\N	4
2416	009_enrich_destinations_table.sql	2025-08-24 07:47:32.033698	started	\N	\N	0
2417	009_enrich_destinations_table.sql	2025-08-24 07:47:32.033698	completed	\N	\N	13
2418	010_create_foreign_keys_constraints.sql	2025-08-24 07:47:33.111018	started	\N	\N	0
2419	010_create_foreign_keys_constraints.sql	2025-08-24 07:47:33.111018	completed	\N	\N	0
2420	011_create_performance_indexes.sql	2025-08-24 07:47:33.998188	started	\N	\N	0
2421	011_create_performance_indexes.sql	2025-08-24 07:47:33.998188	completed	\N	\N	0
2422	012_create_homepage_views.sql	2025-08-24 07:47:34.767698	started	\N	\N	0
2423	012_create_homepage_views.sql	2025-08-24 07:47:34.767698	completed	\N	\N	0
2424	013_create_utility_functions.sql	2025-08-24 07:47:35.563979	started	\N	\N	0
2425	013_create_utility_functions.sql	2025-08-24 07:47:35.563979	completed	\N	\N	0
2426	014_seed_database_data.sql	2025-08-24 07:47:36.202661	started	\N	\N	0
2427	014_seed_database_data.sql	2025-08-24 07:47:36.202661	completed	\N	\N	75
2730	011_create_performance_indexes.sql	2025-08-24 07:59:25.834717	started	\N	\N	0
2429	001_backup_preparation.sql	2025-08-24 07:48:14.289627	completed	\N	\N	0
2430	002_create_tour_categories.sql	2025-08-24 07:48:14.358242	started	\N	\N	0
2431	002_create_tour_categories.sql	2025-08-24 07:48:14.358242	completed	\N	\N	8
2432	003_create_special_offers.sql	2025-08-24 07:48:14.60151	started	\N	\N	0
2433	003_create_special_offers.sql	2025-08-24 07:48:14.60151	completed	\N	\N	2
2434	004_create_tour_statistics.sql	2025-08-24 07:48:14.892649	started	\N	\N	0
2435	004_create_tour_statistics.sql	2025-08-24 07:48:14.892649	completed	\N	\N	0
2436	005_create_featured_reviews.sql	2025-08-24 07:48:15.2189	started	\N	\N	0
2437	005_create_featured_reviews.sql	2025-08-24 07:48:15.2189	completed	\N	\N	5
2438	006_create_homepage_settings.sql	2025-08-24 07:48:15.661045	started	\N	\N	0
2439	006_create_homepage_settings.sql	2025-08-24 07:48:15.661045	completed	\N	\N	10
2440	007_enrich_tours_table.sql	2025-08-24 07:48:16.070469	started	\N	\N	0
2441	007_enrich_tours_table.sql	2025-08-24 07:48:16.070469	completed	\N	\N	11
2442	008_enrich_blog_posts_table.sql	2025-08-24 07:48:16.711743	started	\N	\N	0
2443	008_enrich_blog_posts_table.sql	2025-08-24 07:48:16.711743	completed	\N	\N	4
2444	009_enrich_destinations_table.sql	2025-08-24 07:48:17.494859	started	\N	\N	0
2445	009_enrich_destinations_table.sql	2025-08-24 07:48:17.494859	completed	\N	\N	13
2446	010_create_foreign_keys_constraints.sql	2025-08-24 07:48:18.530224	started	\N	\N	0
2447	010_create_foreign_keys_constraints.sql	2025-08-24 07:48:18.530224	completed	\N	\N	0
2448	011_create_performance_indexes.sql	2025-08-24 07:48:19.34068	started	\N	\N	0
2449	011_create_performance_indexes.sql	2025-08-24 07:48:19.34068	completed	\N	\N	0
2450	012_create_homepage_views.sql	2025-08-24 07:48:20.134508	started	\N	\N	0
2451	012_create_homepage_views.sql	2025-08-24 07:48:20.134508	completed	\N	\N	0
2452	013_create_utility_functions.sql	2025-08-24 07:48:20.945863	started	\N	\N	0
2453	013_create_utility_functions.sql	2025-08-24 07:48:20.945863	completed	\N	\N	0
2454	014_seed_database_data.sql	2025-08-24 07:48:21.580123	started	\N	\N	0
2455	014_seed_database_data.sql	2025-08-24 07:48:21.580123	completed	\N	\N	75
2731	011_create_performance_indexes.sql	2025-08-24 07:59:25.834717	completed	\N	\N	0
2457	001_backup_preparation.sql	2025-08-24 07:49:35.023055	completed	\N	\N	0
2458	002_create_tour_categories.sql	2025-08-24 07:49:35.070374	started	\N	\N	0
2459	002_create_tour_categories.sql	2025-08-24 07:49:35.070374	completed	\N	\N	8
2460	003_create_special_offers.sql	2025-08-24 07:49:35.360581	started	\N	\N	0
2461	003_create_special_offers.sql	2025-08-24 07:49:35.360581	completed	\N	\N	2
2462	004_create_tour_statistics.sql	2025-08-24 07:49:35.833808	started	\N	\N	0
2463	004_create_tour_statistics.sql	2025-08-24 07:49:35.833808	completed	\N	\N	0
2464	005_create_featured_reviews.sql	2025-08-24 07:49:36.212151	started	\N	\N	0
2465	005_create_featured_reviews.sql	2025-08-24 07:49:36.212151	completed	\N	\N	5
2466	006_create_homepage_settings.sql	2025-08-24 07:49:36.722276	started	\N	\N	0
2467	006_create_homepage_settings.sql	2025-08-24 07:49:36.722276	completed	\N	\N	10
2468	007_enrich_tours_table.sql	2025-08-24 07:49:37.177573	started	\N	\N	0
2469	007_enrich_tours_table.sql	2025-08-24 07:49:37.177573	completed	\N	\N	11
2470	008_enrich_blog_posts_table.sql	2025-08-24 07:49:37.861332	started	\N	\N	0
2471	008_enrich_blog_posts_table.sql	2025-08-24 07:49:37.861332	completed	\N	\N	4
2472	009_enrich_destinations_table.sql	2025-08-24 07:49:38.529403	started	\N	\N	0
2473	009_enrich_destinations_table.sql	2025-08-24 07:49:38.529403	completed	\N	\N	13
2474	010_create_foreign_keys_constraints.sql	2025-08-24 07:49:39.597961	started	\N	\N	0
2475	010_create_foreign_keys_constraints.sql	2025-08-24 07:49:39.597961	completed	\N	\N	0
2476	011_create_performance_indexes.sql	2025-08-24 07:49:40.449553	started	\N	\N	0
2477	011_create_performance_indexes.sql	2025-08-24 07:49:40.449553	completed	\N	\N	0
2478	012_create_homepage_views.sql	2025-08-24 07:49:41.29496	started	\N	\N	0
2479	012_create_homepage_views.sql	2025-08-24 07:49:41.29496	completed	\N	\N	0
2480	013_create_utility_functions.sql	2025-08-24 07:49:42.070159	started	\N	\N	0
2481	013_create_utility_functions.sql	2025-08-24 07:49:42.070159	completed	\N	\N	0
2482	014_seed_database_data.sql	2025-08-24 07:49:42.793601	started	\N	\N	0
2483	014_seed_database_data.sql	2025-08-24 07:49:42.793601	completed	\N	\N	75
2732	012_create_homepage_views.sql	2025-08-24 07:59:26.613212	started	\N	\N	0
2485	001_backup_preparation.sql	2025-08-24 07:50:34.824126	completed	\N	\N	0
2486	002_create_tour_categories.sql	2025-08-24 07:50:34.878229	started	\N	\N	0
2487	002_create_tour_categories.sql	2025-08-24 07:50:34.878229	completed	\N	\N	8
2488	003_create_special_offers.sql	2025-08-24 07:50:35.218098	started	\N	\N	0
2489	003_create_special_offers.sql	2025-08-24 07:50:35.218098	completed	\N	\N	2
2490	004_create_tour_statistics.sql	2025-08-24 07:50:35.610748	started	\N	\N	0
2491	004_create_tour_statistics.sql	2025-08-24 07:50:35.610748	completed	\N	\N	0
2492	005_create_featured_reviews.sql	2025-08-24 07:50:36.030678	started	\N	\N	0
2493	005_create_featured_reviews.sql	2025-08-24 07:50:36.030678	completed	\N	\N	5
2494	006_create_homepage_settings.sql	2025-08-24 07:50:36.533837	started	\N	\N	0
2495	006_create_homepage_settings.sql	2025-08-24 07:50:36.533837	completed	\N	\N	10
2496	007_enrich_tours_table.sql	2025-08-24 07:50:37.010634	started	\N	\N	0
2497	007_enrich_tours_table.sql	2025-08-24 07:50:37.010634	completed	\N	\N	11
2498	008_enrich_blog_posts_table.sql	2025-08-24 07:50:37.63362	started	\N	\N	0
2499	008_enrich_blog_posts_table.sql	2025-08-24 07:50:37.63362	completed	\N	\N	4
2500	009_enrich_destinations_table.sql	2025-08-24 07:50:38.322302	started	\N	\N	0
2501	009_enrich_destinations_table.sql	2025-08-24 07:50:38.322302	completed	\N	\N	13
2502	010_create_foreign_keys_constraints.sql	2025-08-24 07:50:39.294528	started	\N	\N	0
2503	010_create_foreign_keys_constraints.sql	2025-08-24 07:50:39.294528	completed	\N	\N	0
2504	011_create_performance_indexes.sql	2025-08-24 07:50:40.128951	started	\N	\N	0
2505	011_create_performance_indexes.sql	2025-08-24 07:50:40.128951	completed	\N	\N	0
2506	012_create_homepage_views.sql	2025-08-24 07:50:40.969162	started	\N	\N	0
2507	012_create_homepage_views.sql	2025-08-24 07:50:40.969162	completed	\N	\N	0
2508	013_create_utility_functions.sql	2025-08-24 07:50:41.744535	started	\N	\N	0
2509	013_create_utility_functions.sql	2025-08-24 07:50:41.744535	completed	\N	\N	0
2510	014_seed_database_data.sql	2025-08-24 07:50:42.390878	started	\N	\N	0
2511	014_seed_database_data.sql	2025-08-24 07:50:42.390878	completed	\N	\N	75
2733	012_create_homepage_views.sql	2025-08-24 07:59:26.613212	completed	\N	\N	0
2513	001_backup_preparation.sql	2025-08-24 07:51:33.513904	completed	\N	\N	0
2514	002_create_tour_categories.sql	2025-08-24 07:51:33.58894	started	\N	\N	0
2515	002_create_tour_categories.sql	2025-08-24 07:51:33.58894	completed	\N	\N	8
2516	003_create_special_offers.sql	2025-08-24 07:51:33.877103	started	\N	\N	0
2517	003_create_special_offers.sql	2025-08-24 07:51:33.877103	completed	\N	\N	2
2518	004_create_tour_statistics.sql	2025-08-24 07:51:34.168162	started	\N	\N	0
2519	004_create_tour_statistics.sql	2025-08-24 07:51:34.168162	completed	\N	\N	0
2520	005_create_featured_reviews.sql	2025-08-24 07:51:34.51129	started	\N	\N	0
2521	005_create_featured_reviews.sql	2025-08-24 07:51:34.51129	completed	\N	\N	5
2522	006_create_homepage_settings.sql	2025-08-24 07:51:34.960802	started	\N	\N	0
2523	006_create_homepage_settings.sql	2025-08-24 07:51:34.960802	completed	\N	\N	10
2524	007_enrich_tours_table.sql	2025-08-24 07:51:35.385008	started	\N	\N	0
2525	007_enrich_tours_table.sql	2025-08-24 07:51:35.385008	completed	\N	\N	11
2526	008_enrich_blog_posts_table.sql	2025-08-24 07:51:36.02708	started	\N	\N	0
2527	008_enrich_blog_posts_table.sql	2025-08-24 07:51:36.02708	completed	\N	\N	4
2528	009_enrich_destinations_table.sql	2025-08-24 07:51:36.748517	started	\N	\N	0
2529	009_enrich_destinations_table.sql	2025-08-24 07:51:36.748517	completed	\N	\N	13
2530	010_create_foreign_keys_constraints.sql	2025-08-24 07:51:37.874208	started	\N	\N	0
2531	010_create_foreign_keys_constraints.sql	2025-08-24 07:51:37.874208	completed	\N	\N	0
2532	011_create_performance_indexes.sql	2025-08-24 07:51:38.715338	started	\N	\N	0
2533	011_create_performance_indexes.sql	2025-08-24 07:51:38.715338	completed	\N	\N	0
2534	012_create_homepage_views.sql	2025-08-24 07:51:39.549552	started	\N	\N	0
2535	012_create_homepage_views.sql	2025-08-24 07:51:39.549552	completed	\N	\N	0
2536	013_create_utility_functions.sql	2025-08-24 07:51:40.395541	started	\N	\N	0
2537	013_create_utility_functions.sql	2025-08-24 07:51:40.395541	completed	\N	\N	0
2538	014_seed_database_data.sql	2025-08-24 07:51:41.040987	started	\N	\N	0
2539	014_seed_database_data.sql	2025-08-24 07:51:41.040987	completed	\N	\N	75
2734	013_create_utility_functions.sql	2025-08-24 07:59:27.403217	started	\N	\N	0
2541	001_backup_preparation.sql	2025-08-24 07:53:55.171194	completed	\N	\N	0
2542	002_create_tour_categories.sql	2025-08-24 07:53:55.244195	started	\N	\N	0
2543	002_create_tour_categories.sql	2025-08-24 07:53:55.244195	completed	\N	\N	8
2544	003_create_special_offers.sql	2025-08-24 07:53:55.492989	started	\N	\N	0
2545	003_create_special_offers.sql	2025-08-24 07:53:55.492989	completed	\N	\N	2
2546	004_create_tour_statistics.sql	2025-08-24 07:53:55.79466	started	\N	\N	0
2547	004_create_tour_statistics.sql	2025-08-24 07:53:55.79466	completed	\N	\N	0
2548	005_create_featured_reviews.sql	2025-08-24 07:53:56.165091	started	\N	\N	0
2549	005_create_featured_reviews.sql	2025-08-24 07:53:56.165091	completed	\N	\N	5
2550	006_create_homepage_settings.sql	2025-08-24 07:53:56.627985	started	\N	\N	0
2551	006_create_homepage_settings.sql	2025-08-24 07:53:56.627985	completed	\N	\N	10
2552	007_enrich_tours_table.sql	2025-08-24 07:53:57.162184	started	\N	\N	0
2553	007_enrich_tours_table.sql	2025-08-24 07:53:57.162184	completed	\N	\N	11
2554	008_enrich_blog_posts_table.sql	2025-08-24 07:53:57.817738	started	\N	\N	0
2555	008_enrich_blog_posts_table.sql	2025-08-24 07:53:57.817738	completed	\N	\N	4
2556	009_enrich_destinations_table.sql	2025-08-24 07:53:58.562027	started	\N	\N	0
2557	009_enrich_destinations_table.sql	2025-08-24 07:53:58.562027	completed	\N	\N	13
2558	010_create_foreign_keys_constraints.sql	2025-08-24 07:53:59.599788	started	\N	\N	0
2559	010_create_foreign_keys_constraints.sql	2025-08-24 07:53:59.599788	completed	\N	\N	0
2560	011_create_performance_indexes.sql	2025-08-24 07:54:00.522819	started	\N	\N	0
2561	011_create_performance_indexes.sql	2025-08-24 07:54:00.522819	completed	\N	\N	0
2562	012_create_homepage_views.sql	2025-08-24 07:54:01.299643	started	\N	\N	0
2563	012_create_homepage_views.sql	2025-08-24 07:54:01.299643	completed	\N	\N	0
2564	013_create_utility_functions.sql	2025-08-24 07:54:02.040177	started	\N	\N	0
2565	013_create_utility_functions.sql	2025-08-24 07:54:02.040177	completed	\N	\N	0
2566	014_seed_database_data.sql	2025-08-24 07:54:02.71524	started	\N	\N	0
2567	014_seed_database_data.sql	2025-08-24 07:54:02.71524	completed	\N	\N	75
2735	013_create_utility_functions.sql	2025-08-24 07:59:27.403217	completed	\N	\N	0
2569	001_backup_preparation.sql	2025-08-24 07:54:45.812064	completed	\N	\N	0
2570	002_create_tour_categories.sql	2025-08-24 07:54:45.884567	started	\N	\N	0
2571	002_create_tour_categories.sql	2025-08-24 07:54:45.884567	completed	\N	\N	8
2572	003_create_special_offers.sql	2025-08-24 07:54:46.133604	started	\N	\N	0
2573	003_create_special_offers.sql	2025-08-24 07:54:46.133604	completed	\N	\N	2
2574	004_create_tour_statistics.sql	2025-08-24 07:54:46.434253	started	\N	\N	0
2575	004_create_tour_statistics.sql	2025-08-24 07:54:46.434253	completed	\N	\N	0
2576	005_create_featured_reviews.sql	2025-08-24 07:54:46.770653	started	\N	\N	0
2577	005_create_featured_reviews.sql	2025-08-24 07:54:46.770653	completed	\N	\N	5
2578	006_create_homepage_settings.sql	2025-08-24 07:54:47.20816	started	\N	\N	0
2579	006_create_homepage_settings.sql	2025-08-24 07:54:47.20816	completed	\N	\N	10
2580	007_enrich_tours_table.sql	2025-08-24 07:54:47.6352	started	\N	\N	0
2581	007_enrich_tours_table.sql	2025-08-24 07:54:47.6352	completed	\N	\N	11
2582	008_enrich_blog_posts_table.sql	2025-08-24 07:54:48.376733	started	\N	\N	0
2583	008_enrich_blog_posts_table.sql	2025-08-24 07:54:48.376733	completed	\N	\N	4
2584	009_enrich_destinations_table.sql	2025-08-24 07:54:49.055406	started	\N	\N	0
2585	009_enrich_destinations_table.sql	2025-08-24 07:54:49.055406	completed	\N	\N	13
2586	010_create_foreign_keys_constraints.sql	2025-08-24 07:54:50.070232	started	\N	\N	0
2587	010_create_foreign_keys_constraints.sql	2025-08-24 07:54:50.070232	completed	\N	\N	0
2588	011_create_performance_indexes.sql	2025-08-24 07:54:50.904119	started	\N	\N	0
2589	011_create_performance_indexes.sql	2025-08-24 07:54:50.904119	completed	\N	\N	0
2590	012_create_homepage_views.sql	2025-08-24 07:54:51.725895	started	\N	\N	0
2591	012_create_homepage_views.sql	2025-08-24 07:54:51.725895	completed	\N	\N	0
2592	013_create_utility_functions.sql	2025-08-24 07:54:52.492503	started	\N	\N	0
2593	013_create_utility_functions.sql	2025-08-24 07:54:52.492503	completed	\N	\N	0
2594	014_seed_database_data.sql	2025-08-24 07:54:53.134129	started	\N	\N	0
2595	014_seed_database_data.sql	2025-08-24 07:54:53.134129	completed	\N	\N	75
2736	014_seed_database_data.sql	2025-08-24 07:59:28.045027	started	\N	\N	0
2597	001_backup_preparation.sql	2025-08-24 07:55:17.087026	completed	\N	\N	0
2598	002_create_tour_categories.sql	2025-08-24 07:55:17.15963	started	\N	\N	0
2599	002_create_tour_categories.sql	2025-08-24 07:55:17.15963	completed	\N	\N	8
2600	003_create_special_offers.sql	2025-08-24 07:55:17.406379	started	\N	\N	0
2601	003_create_special_offers.sql	2025-08-24 07:55:17.406379	completed	\N	\N	2
2602	004_create_tour_statistics.sql	2025-08-24 07:55:17.717589	started	\N	\N	0
2603	004_create_tour_statistics.sql	2025-08-24 07:55:17.717589	completed	\N	\N	0
2604	005_create_featured_reviews.sql	2025-08-24 07:55:18.068465	started	\N	\N	0
2605	005_create_featured_reviews.sql	2025-08-24 07:55:18.068465	completed	\N	\N	5
2606	006_create_homepage_settings.sql	2025-08-24 07:55:18.519506	started	\N	\N	0
2607	006_create_homepage_settings.sql	2025-08-24 07:55:18.519506	completed	\N	\N	10
2608	007_enrich_tours_table.sql	2025-08-24 07:55:18.935265	started	\N	\N	0
2609	007_enrich_tours_table.sql	2025-08-24 07:55:18.935265	completed	\N	\N	11
2610	008_enrich_blog_posts_table.sql	2025-08-24 07:55:19.585813	started	\N	\N	0
2611	008_enrich_blog_posts_table.sql	2025-08-24 07:55:19.585813	completed	\N	\N	4
2612	009_enrich_destinations_table.sql	2025-08-24 07:55:20.286731	started	\N	\N	0
2613	009_enrich_destinations_table.sql	2025-08-24 07:55:20.286731	completed	\N	\N	13
2614	010_create_foreign_keys_constraints.sql	2025-08-24 07:55:21.281253	started	\N	\N	0
2615	010_create_foreign_keys_constraints.sql	2025-08-24 07:55:21.281253	completed	\N	\N	0
2616	011_create_performance_indexes.sql	2025-08-24 07:55:22.085993	started	\N	\N	0
2617	011_create_performance_indexes.sql	2025-08-24 07:55:22.085993	completed	\N	\N	0
2618	012_create_homepage_views.sql	2025-08-24 07:55:22.846903	started	\N	\N	0
2619	012_create_homepage_views.sql	2025-08-24 07:55:22.846903	completed	\N	\N	0
2620	013_create_utility_functions.sql	2025-08-24 07:55:23.587084	started	\N	\N	0
2621	013_create_utility_functions.sql	2025-08-24 07:55:23.587084	completed	\N	\N	0
2622	014_seed_database_data.sql	2025-08-24 07:55:24.259621	started	\N	\N	0
2623	014_seed_database_data.sql	2025-08-24 07:55:24.259621	completed	\N	\N	75
2737	014_seed_database_data.sql	2025-08-24 07:59:28.045027	completed	\N	\N	75
2625	001_backup_preparation.sql	2025-08-24 07:56:17.786097	completed	\N	\N	0
2626	002_create_tour_categories.sql	2025-08-24 07:56:17.830072	started	\N	\N	0
2627	002_create_tour_categories.sql	2025-08-24 07:56:17.830072	completed	\N	\N	8
2628	003_create_special_offers.sql	2025-08-24 07:56:18.115767	started	\N	\N	0
2629	003_create_special_offers.sql	2025-08-24 07:56:18.115767	completed	\N	\N	2
2630	004_create_tour_statistics.sql	2025-08-24 07:56:18.473838	started	\N	\N	0
2631	004_create_tour_statistics.sql	2025-08-24 07:56:18.473838	completed	\N	\N	0
2632	005_create_featured_reviews.sql	2025-08-24 07:56:18.859336	started	\N	\N	0
2633	005_create_featured_reviews.sql	2025-08-24 07:56:18.859336	completed	\N	\N	5
2634	006_create_homepage_settings.sql	2025-08-24 07:56:19.354219	started	\N	\N	0
2635	006_create_homepage_settings.sql	2025-08-24 07:56:19.354219	completed	\N	\N	10
2636	007_enrich_tours_table.sql	2025-08-24 07:56:19.809665	started	\N	\N	0
2637	007_enrich_tours_table.sql	2025-08-24 07:56:19.809665	completed	\N	\N	11
2638	008_enrich_blog_posts_table.sql	2025-08-24 07:56:20.439556	started	\N	\N	0
2639	008_enrich_blog_posts_table.sql	2025-08-24 07:56:20.439556	completed	\N	\N	4
2640	009_enrich_destinations_table.sql	2025-08-24 07:56:21.135675	started	\N	\N	0
2641	009_enrich_destinations_table.sql	2025-08-24 07:56:21.135675	completed	\N	\N	13
2642	010_create_foreign_keys_constraints.sql	2025-08-24 07:56:22.151718	started	\N	\N	0
2643	010_create_foreign_keys_constraints.sql	2025-08-24 07:56:22.151718	completed	\N	\N	0
2644	011_create_performance_indexes.sql	2025-08-24 07:56:22.950807	started	\N	\N	0
2645	011_create_performance_indexes.sql	2025-08-24 07:56:22.950807	completed	\N	\N	0
2646	012_create_homepage_views.sql	2025-08-24 07:56:23.738923	started	\N	\N	0
2647	012_create_homepage_views.sql	2025-08-24 07:56:23.738923	completed	\N	\N	0
2648	013_create_utility_functions.sql	2025-08-24 07:56:24.545153	started	\N	\N	0
2649	013_create_utility_functions.sql	2025-08-24 07:56:24.545153	completed	\N	\N	0
2650	014_seed_database_data.sql	2025-08-24 07:56:25.255979	started	\N	\N	0
2651	014_seed_database_data.sql	2025-08-24 07:56:25.255979	completed	\N	\N	75
2738	015_database_integrity_tests.sql	2025-08-24 07:59:29.012102	started	\N	\N	0
2653	001_backup_preparation.sql	2025-08-24 07:57:45.483455	completed	\N	\N	0
2654	002_create_tour_categories.sql	2025-08-24 07:57:45.533763	started	\N	\N	0
2655	002_create_tour_categories.sql	2025-08-24 07:57:45.533763	completed	\N	\N	8
2656	003_create_special_offers.sql	2025-08-24 07:57:45.786514	started	\N	\N	0
2657	003_create_special_offers.sql	2025-08-24 07:57:45.786514	completed	\N	\N	2
2658	004_create_tour_statistics.sql	2025-08-24 07:57:46.089113	started	\N	\N	0
2659	004_create_tour_statistics.sql	2025-08-24 07:57:46.089113	completed	\N	\N	0
2660	005_create_featured_reviews.sql	2025-08-24 07:57:46.438217	started	\N	\N	0
2661	005_create_featured_reviews.sql	2025-08-24 07:57:46.438217	completed	\N	\N	5
2662	006_create_homepage_settings.sql	2025-08-24 07:57:46.881753	started	\N	\N	0
2663	006_create_homepage_settings.sql	2025-08-24 07:57:46.881753	completed	\N	\N	10
2664	007_enrich_tours_table.sql	2025-08-24 07:57:47.469186	started	\N	\N	0
2665	007_enrich_tours_table.sql	2025-08-24 07:57:47.469186	completed	\N	\N	11
2666	008_enrich_blog_posts_table.sql	2025-08-24 07:57:48.202352	started	\N	\N	0
2667	008_enrich_blog_posts_table.sql	2025-08-24 07:57:48.202352	completed	\N	\N	4
2668	009_enrich_destinations_table.sql	2025-08-24 07:57:48.984229	started	\N	\N	0
2669	009_enrich_destinations_table.sql	2025-08-24 07:57:48.984229	completed	\N	\N	13
2670	010_create_foreign_keys_constraints.sql	2025-08-24 07:57:49.986397	started	\N	\N	0
2671	010_create_foreign_keys_constraints.sql	2025-08-24 07:57:49.986397	completed	\N	\N	0
2672	011_create_performance_indexes.sql	2025-08-24 07:57:51.07346	started	\N	\N	0
2673	011_create_performance_indexes.sql	2025-08-24 07:57:51.07346	completed	\N	\N	0
2674	012_create_homepage_views.sql	2025-08-24 07:57:51.83431	started	\N	\N	0
2675	012_create_homepage_views.sql	2025-08-24 07:57:51.83431	completed	\N	\N	0
2676	013_create_utility_functions.sql	2025-08-24 07:57:52.624898	started	\N	\N	0
2677	013_create_utility_functions.sql	2025-08-24 07:57:52.624898	completed	\N	\N	0
2678	014_seed_database_data.sql	2025-08-24 07:57:53.270745	started	\N	\N	0
2679	014_seed_database_data.sql	2025-08-24 07:57:53.270745	completed	\N	\N	75
2680	015_database_integrity_tests.sql	2025-08-24 07:57:54.480298	started	\N	\N	0
2681	015_database_integrity_tests.sql	2025-08-24 07:57:54.480298	completed	\N	\N	29
2739	015_database_integrity_tests.sql	2025-08-24 07:59:29.012102	completed	\N	\N	29
2741	002_create_tour_categories.sql	2025-08-24 08:00:19.605801	started	\N	\N	0
2742	002_create_tour_categories.sql	2025-08-24 08:00:19.605801	completed	\N	\N	8
2743	003_create_special_offers.sql	2025-08-24 08:00:19.858123	started	\N	\N	0
2744	003_create_special_offers.sql	2025-08-24 08:00:19.858123	completed	\N	\N	2
2745	004_create_tour_statistics.sql	2025-08-24 08:00:20.158794	started	\N	\N	0
2746	004_create_tour_statistics.sql	2025-08-24 08:00:20.158794	completed	\N	\N	0
2747	005_create_featured_reviews.sql	2025-08-24 08:00:20.505104	started	\N	\N	0
2748	005_create_featured_reviews.sql	2025-08-24 08:00:20.505104	completed	\N	\N	5
2749	006_create_homepage_settings.sql	2025-08-24 08:00:20.97539	started	\N	\N	0
2750	006_create_homepage_settings.sql	2025-08-24 08:00:20.97539	completed	\N	\N	10
2751	007_enrich_tours_table.sql	2025-08-24 08:00:21.520354	started	\N	\N	0
2752	007_enrich_tours_table.sql	2025-08-24 08:00:21.520354	completed	\N	\N	11
2753	008_enrich_blog_posts_table.sql	2025-08-24 08:00:22.182809	started	\N	\N	0
2754	008_enrich_blog_posts_table.sql	2025-08-24 08:00:22.182809	completed	\N	\N	4
2755	009_enrich_destinations_table.sql	2025-08-24 08:00:22.894325	started	\N	\N	0
2756	009_enrich_destinations_table.sql	2025-08-24 08:00:22.894325	completed	\N	\N	13
2757	010_create_foreign_keys_constraints.sql	2025-08-24 08:00:23.88497	started	\N	\N	0
2758	010_create_foreign_keys_constraints.sql	2025-08-24 08:00:23.88497	completed	\N	\N	0
2759	011_create_performance_indexes.sql	2025-08-24 08:00:24.718475	started	\N	\N	0
2760	011_create_performance_indexes.sql	2025-08-24 08:00:24.718475	completed	\N	\N	0
2761	012_create_homepage_views.sql	2025-08-24 08:00:25.601536	started	\N	\N	0
2762	012_create_homepage_views.sql	2025-08-24 08:00:25.601536	completed	\N	\N	0
2763	013_create_utility_functions.sql	2025-08-24 08:00:26.38399	started	\N	\N	0
2764	013_create_utility_functions.sql	2025-08-24 08:00:26.38399	completed	\N	\N	0
2765	014_seed_database_data.sql	2025-08-24 08:00:27.067268	started	\N	\N	0
2766	014_seed_database_data.sql	2025-08-24 08:00:27.067268	completed	\N	\N	75
2767	015_database_integrity_tests.sql	2025-08-24 08:00:28.015291	started	\N	\N	0
2768	015_database_integrity_tests.sql	2025-08-24 08:00:28.015291	completed	\N	\N	29
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, name, subject, email_template, sms_template, push_template, variables, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, booking_id, type, channel, status, sent_at, template_id, priority, scheduled_at, opened_at, clicked_at, metadata, title, message, is_read) FROM stdin;
\.


--
-- Data for Name: packagetiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.packagetiers (id, tour_id, tier_name, price, hotel_type, included_vehicle_id, inclusions_summary) FROM stdin;
1	1	Standard	20000.00	3-Star Hotel	\N	{Breakfast,Guide,Transport}
2	1	Premium	30000.00	4-Star Resort	\N	{"All meals",Guide,Transport,Activities}
3	1	Luxury	45000.00	5-Star Resort	\N	{"All meals","Private Guide","Luxury Transport","All activities"}
4	2	Standard	25000.00	3-Star Hotel	\N	{Breakfast,Guide,Transport}
5	2	Premium	35000.00	4-Star Resort	\N	{"All meals",Guide,Transport,Activities}
6	2	Luxury	50000.00	5-Star Resort	\N	{"All meals","Private Guide","Luxury Transport","All activities"}
7	3	Standard	30000.00	3-Star Hotel	\N	{Breakfast,Guide,Transport}
8	3	Premium	40000.00	4-Star Resort	\N	{"All meals",Guide,Transport,Activities}
9	3	Luxury	55000.00	5-Star Resort	\N	{"All meals","Private Guide","Luxury Transport","All activities"}
10	4	Standard	35000.00	3-Star Hotel	\N	{Breakfast,Guide,Transport}
11	4	Premium	45000.00	4-Star Resort	\N	{"All meals",Guide,Transport,Activities}
12	4	Luxury	60000.00	5-Star Resort	\N	{"All meals","Private Guide","Luxury Transport","All activities"}
13	5	Standard	40000.00	3-Star Hotel	\N	{Breakfast,Guide,Transport}
14	5	Premium	50000.00	4-Star Resort	\N	{"All meals",Guide,Transport,Activities}
15	5	Luxury	65000.00	5-Star Resort	\N	{"All meals","Private Guide","Luxury Transport","All activities"}
16	6	Standard	45000.00	3-Star Hotel	\N	{Breakfast,Guide,Transport}
17	6	Premium	55000.00	4-Star Resort	\N	{"All meals",Guide,Transport,Activities}
18	6	Luxury	70000.00	5-Star Resort	\N	{"All meals","Private Guide","Luxury Transport","All activities"}
\.


--
-- Data for Name: passwordresets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passwordresets (id, user_id, reset_token, expires_at, status, email) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, booking_id, gateway_transaction_id, amount, currency, status, payment_date) FROM stdin;
1	1	pi_test_1	35000.00	USD	completed	2025-08-18 15:26:13.662216+01
2	2	pi_test_2	45000.00	USD	completed	2025-08-17 15:26:13.662216+01
3	3	pi_test_3	55000.00	USD	completed	2025-08-16 15:26:13.662216+01
4	4	pi_test_4	35000.00	USD	completed	2025-08-15 15:26:13.662216+01
5	5	pi_test_5	45000.00	USD	completed	2025-08-14 15:26:13.662216+01
6	6	pi_test_6	55000.00	USD	completed	2025-08-13 15:26:13.662216+01
7	7	pi_test_7	35000.00	USD	completed	2025-08-12 15:26:13.662216+01
8	8	pi_test_8	45000.00	USD	completed	2025-08-11 15:26:13.662216+01
9	9	pi_test_9	40000.00	USD	completed	2025-08-18 15:26:13.662216+01
10	10	pi_test_10	50000.00	USD	completed	2025-08-17 15:26:13.662216+01
11	11	pi_test_11	60000.00	USD	completed	2025-08-16 15:26:13.662216+01
12	12	pi_test_12	40000.00	USD	completed	2025-08-15 15:26:13.662216+01
13	13	pi_test_13	50000.00	USD	completed	2025-08-14 15:26:13.662216+01
14	14	pi_test_14	60000.00	USD	completed	2025-08-13 15:26:13.662216+01
15	15	pi_test_15	40000.00	USD	completed	2025-08-12 15:26:13.662216+01
16	16	pi_test_16	50000.00	USD	completed	2025-08-11 15:26:13.662216+01
17	17	pi_test_17	45000.00	USD	completed	2025-08-18 15:26:13.662216+01
18	18	pi_test_18	55000.00	USD	completed	2025-08-17 15:26:13.662216+01
19	19	pi_test_19	65000.00	USD	completed	2025-08-16 15:26:13.662216+01
20	20	pi_test_20	45000.00	USD	completed	2025-08-15 15:26:13.662216+01
21	21	pi_test_21	55000.00	USD	completed	2025-08-14 15:26:13.662216+01
22	22	pi_test_22	65000.00	USD	completed	2025-08-13 15:26:13.662216+01
23	23	pi_test_23	45000.00	USD	completed	2025-08-12 15:26:13.662216+01
24	24	pi_test_24	55000.00	USD	completed	2025-08-11 15:26:13.662216+01
25	25	pi_test_25	67000.00	USD	completed	2025-08-21 15:26:13.662216+01
26	26	pi_test_26	79000.00	USD	completed	2025-08-20 15:26:13.662216+01
27	27	pi_test_27	91000.00	USD	completed	2025-08-19 15:26:13.662216+01
28	28	pi_test_28	73000.00	USD	completed	2025-08-21 15:26:13.662216+01
29	29	pi_test_29	85000.00	USD	completed	2025-08-20 15:26:13.662216+01
30	30	pi_test_30	97000.00	USD	completed	2025-08-19 15:26:13.662216+01
\.


--
-- Data for Name: review_helpfulness; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_helpfulness (id, review_id, user_id, is_helpful, created_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, user_id, tour_id, rating, review_text, is_approved, submission_date, helpful_count, images, verified_purchase, response_from_admin, responded_at, travel_date) FROM stdin;
1	1	1	4	Excellent tour! Kanyakumari Sunrise Spectacle exceeded all expectations. Highly recommended for everyone!	t	2025-08-21 15:26:13.662216+01	0	\N	f	\N	\N	\N
2	2	1	5	Excellent tour! Kanyakumari Sunrise Spectacle exceeded all expectations. Highly recommended for everyone!	t	2025-08-19 15:26:13.662216+01	0	\N	f	\N	\N	\N
3	3	1	4	Excellent tour! Kanyakumari Sunrise Spectacle exceeded all expectations. Highly recommended for everyone!	t	2025-08-17 15:26:13.662216+01	0	\N	f	\N	\N	\N
4	4	1	4	Excellent tour! Kanyakumari Sunrise Spectacle exceeded all expectations. Highly recommended for everyone!	t	2025-08-15 15:26:13.662216+01	0	\N	f	\N	\N	\N
5	2	2	5	Excellent tour! Cochin Backwater Cruise exceeded all expectations. Highly recommended for everyone!	t	2025-08-21 15:26:13.662216+01	0	\N	f	\N	\N	\N
6	3	2	4	Excellent tour! Cochin Backwater Cruise exceeded all expectations. Highly recommended for everyone!	t	2025-08-19 15:26:13.662216+01	0	\N	f	\N	\N	\N
7	4	2	4	Excellent tour! Cochin Backwater Cruise exceeded all expectations. Highly recommended for everyone!	t	2025-08-17 15:26:13.662216+01	0	\N	f	\N	\N	\N
8	5	2	4	Excellent tour! Cochin Backwater Cruise exceeded all expectations. Highly recommended for everyone!	t	2025-08-15 15:26:13.662216+01	0	\N	f	\N	\N	\N
9	3	3	5	Excellent tour! Munnar Tea Plantation Trek exceeded all expectations. Highly recommended for everyone!	t	2025-08-21 15:26:13.662216+01	0	\N	f	\N	\N	\N
10	4	3	5	Excellent tour! Munnar Tea Plantation Trek exceeded all expectations. Highly recommended for everyone!	t	2025-08-19 15:26:13.662216+01	0	\N	f	\N	\N	\N
11	5	3	5	Excellent tour! Munnar Tea Plantation Trek exceeded all expectations. Highly recommended for everyone!	t	2025-08-17 15:26:13.662216+01	0	\N	f	\N	\N	\N
12	6	3	4	Excellent tour! Munnar Tea Plantation Trek exceeded all expectations. Highly recommended for everyone!	t	2025-08-15 15:26:13.662216+01	0	\N	f	\N	\N	\N
13	4	4	5	Excellent tour! Alleppey Houseboat Experience exceeded all expectations. Highly recommended for everyone!	t	2025-08-21 15:26:13.662216+01	0	\N	f	\N	\N	\N
14	5	4	4	Excellent tour! Alleppey Houseboat Experience exceeded all expectations. Highly recommended for everyone!	t	2025-08-19 15:26:13.662216+01	0	\N	f	\N	\N	\N
15	6	4	5	Excellent tour! Alleppey Houseboat Experience exceeded all expectations. Highly recommended for everyone!	t	2025-08-17 15:26:13.662216+01	0	\N	f	\N	\N	\N
16	7	4	5	Excellent tour! Alleppey Houseboat Experience exceeded all expectations. Highly recommended for everyone!	t	2025-08-15 15:26:13.662216+01	0	\N	f	\N	\N	\N
17	5	5	4	Excellent tour! Thekkady Wildlife Safari exceeded all expectations. Highly recommended for everyone!	t	2025-08-21 15:26:13.662216+01	0	\N	f	\N	\N	\N
18	6	5	5	Excellent tour! Thekkady Wildlife Safari exceeded all expectations. Highly recommended for everyone!	t	2025-08-19 15:26:13.662216+01	0	\N	f	\N	\N	\N
19	7	5	4	Excellent tour! Thekkady Wildlife Safari exceeded all expectations. Highly recommended for everyone!	t	2025-08-17 15:26:13.662216+01	0	\N	f	\N	\N	\N
20	8	5	5	Excellent tour! Thekkady Wildlife Safari exceeded all expectations. Highly recommended for everyone!	t	2025-08-15 15:26:13.662216+01	0	\N	f	\N	\N	\N
21	6	6	4	Excellent tour! Goa Beach Paradise exceeded all expectations. Highly recommended for everyone!	t	2025-08-21 15:26:13.662216+01	0	\N	f	\N	\N	\N
22	7	6	4	Excellent tour! Goa Beach Paradise exceeded all expectations. Highly recommended for everyone!	t	2025-08-19 15:26:13.662216+01	0	\N	f	\N	\N	\N
23	8	6	4	Excellent tour! Goa Beach Paradise exceeded all expectations. Highly recommended for everyone!	t	2025-08-17 15:26:13.662216+01	0	\N	f	\N	\N	\N
24	9	6	5	Excellent tour! Goa Beach Paradise exceeded all expectations. Highly recommended for everyone!	t	2025-08-15 15:26:13.662216+01	0	\N	f	\N	\N	\N
\.


--
-- Data for Name: special_offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.special_offers (id, title, slug, description, short_description, offer_type, discount_percentage, discount_amount, min_booking_amount, max_discount_amount, valid_from, valid_until, usage_limit, usage_count, usage_limit_per_user, promo_code, is_active, is_featured, is_homepage_banner, display_order, banner_image, thumbnail_image, background_color, text_color, terms_conditions, internal_notes, view_count, click_count, conversion_count, created_at, updated_at) FROM stdin;
1	Early Bird Special - 25% Off	early-bird-25-off	Book your South India adventure 60 days in advance and save 25% on all tour packages. Perfect for planning your dream vacation with significant savings.	Book 60 days early and save 25% on all tours!	percentage	25.00	\N	\N	\N	2025-08-24 08:00:19.858123	2025-11-22 08:00:19.858123	\N	0	1	\N	t	t	t	1	/images/offers/early-bird-banner.jpg	\N	#FF6B6B	#FFFFFF	\N	\N	0	0	0	2025-08-24 08:00:19.858123	2025-08-24 08:00:19.858123
2	Summer Special - Cultural Tours	summer-cultural-special	Explore the rich cultural heritage of South India with our special summer packages. Includes guided temple tours, cultural performances, and traditional cuisine experiences.	Special summer rates on cultural heritage tours	percentage	15.00	\N	\N	\N	2025-08-24 08:00:19.858123	2025-12-22 08:00:19.858123	\N	0	1	\N	t	t	f	2	/images/offers/cultural-summer-banner.jpg	\N	#8B4513	#FFFFFF	\N	\N	0	0	0	2025-08-24 08:00:19.858123	2025-08-24 08:00:19.858123
3	Monsoon Magic Special	monsoon-magic-special	Experience the beauty of South India during monsoon season! 20% discount on Kerala backwaters and hill station tours.	\N	percentage	20.00	\N	200.00	150.00	2025-08-24 00:00:00	2025-09-23 00:00:00	100	0	1	\N	t	t	f	0	\N	\N	#FF6B6B	#FFFFFF	\N	\N	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
4	Family Group Discount	family-group-discount	Save â‚¹3000 for any booking of 4 people or more on our family-friendly South India tours.	\N	fixed_amount	\N	50.00	800.00	50.00	2025-08-24 00:00:00	2025-10-23 00:00:00	50	0	1	\N	t	t	f	0	\N	\N	#FF6B6B	#FFFFFF	\N	\N	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
5	Early Bird - Book Ahead	early-bird-book-ahead	Book 2 months in advance and get 15% discount on your South India journey.	\N	percentage	15.00	\N	300.00	200.00	2025-08-24 00:00:00	2025-11-22 00:00:00	200	0	1	\N	t	f	f	0	\N	\N	#FF6B6B	#FFFFFF	\N	\N	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
6	Weekend Flash Offer	weekend-flash-offer	This weekend only: â‚¹7500 instant discount on all premium South India tours!	\N	fixed_amount	\N	100.00	500.00	100.00	2025-08-24 00:00:00	2025-08-27 00:00:00	25	0	1	\N	t	t	f	0	\N	\N	#FF6B6B	#FFFFFF	\N	\N	0	0	0	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, setting_key, setting_value, data_type, description, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: test_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_results (id, test_name, test_category, status, message, expected_value, actual_value, execution_time, created_at) FROM stdin;
88	Tables Existence Check	Structure	PASS	VÃ©rification de l'existence de toutes les tables principales	true	true	00:00:00.002714	2025-08-24 08:00:28.015291
89	FK Tours -> Categories	Foreign Keys	PASS	VÃ©rification que tous les tours ont une catÃ©gorie valide	true	true	00:00:00.00135	2025-08-24 08:00:28.015291
90	FK Tours -> Destinations	Foreign Keys	PASS	VÃ©rification que toutes les liaisons tour-destination sont valides	true	true	00:00:00.002042	2025-08-24 08:00:28.015291
91	FK Reviews -> Tours	Foreign Keys	PASS	VÃ©rification que tous les avis sont liÃ©s Ã  des tours valides	true	true	00:00:00.001416	2025-08-24 08:00:28.015291
92	FK Statistics -> Tours	Foreign Keys	PASS	VÃ©rification que toutes les statistiques sont liÃ©es Ã  des tours valides	true	true	00:00:00.001288	2025-08-24 08:00:28.015291
93	Price Constraints	Data Validation	PASS	VÃ©rification que les prix originaux sont positifs	true	true	00:00:00.001013	2025-08-24 08:00:28.015291
94	Rating Constraints	Data Validation	PASS	VÃ©rification que les notes sont entre 0 et 5	true	true	00:00:00.000962	2025-08-24 08:00:28.015291
95	Review Rating Constraints	Data Validation	PASS	VÃ©rification que les notes des avis sont entre 1 et 5	true	true	00:00:00.000491	2025-08-24 08:00:28.015291
96	Group Size Constraints	Data Validation	PASS	VÃ©rification que la taille de groupe est raisonnable (1-100 personnes)	true	true	00:00:00.000974	2025-08-24 08:00:28.015291
97	Min Age Constraints	Data Validation	PASS	VÃ©rification que l'Ã¢ge minimum est raisonnable (0-99 ans)	true	true	00:00:00.000944	2025-08-24 08:00:28.015291
98	Tour Slug Uniqueness	Data Validation	FAIL	VÃ©rification que tous les slugs de tours sont uniques	true	false	00:00:00.001127	2025-08-24 08:00:28.015291
99	Destination Slug Uniqueness	Data Validation	PASS	VÃ©rification que tous les slugs de destinations sont uniques	true	true	00:00:00.000816	2025-08-24 08:00:28.015291
100	Category Slug Uniqueness	Data Validation	PASS	VÃ©rification que tous les slugs de catÃ©gories sont uniques	true	true	00:00:00.000501	2025-08-24 08:00:28.015291
101	Blog Post Slug Uniqueness	Data Validation	PASS	VÃ©rification que tous les slugs d'articles de blog sont uniques	true	true	00:00:00.000644	2025-08-24 08:00:28.015291
102	Offer Date Validity	Data Validation	PASS	VÃ©rification que les dates de dÃ©but sont antÃ©rieures aux dates de fin pour les offres	true	true	00:00:00.000656	2025-08-24 08:00:28.015291
103	Geographic Coordinates	Data Validation	PASS	VÃ©rification que les coordonnÃ©es gÃ©ographiques sont valides	true	true	00:00:00.001011	2025-08-24 08:00:28.015291
104	Category Statistics Consistency	Data Validation	PASS	VÃ©rification que les statistiques des catÃ©gories sont cohÃ©rentes	true	true	00:00:00.001608	2025-08-24 08:00:28.015291
105	Destination Statistics Consistency	Data Validation	PASS	VÃ©rification que les statistiques des destinations sont cohÃ©rentes	true	true	00:00:00.002157	2025-08-24 08:00:28.015291
106	Active Tours Have Images	Data Validation	FAIL	VÃ©rification que tous les tours actifs ont des images	true	false	00:00:00.001041	2025-08-24 08:00:28.015291
107	Homepage Data View Performance	Performance	PASS	VÃ©rification que la vue homepage_data retourne des donnÃ©es	true	true	00:00:00.003017	2025-08-24 08:00:28.015291
108	Search Function Performance	Performance	FAIL	VÃ©rification que la fonction de recherche fonctionne	true	false	00:00:00.006825	2025-08-24 08:00:28.015291
109	Recommendations Function Performance	Performance	PASS	VÃ©rification que la fonction de recommandations fonctionne	true	true	00:00:00.002806	2025-08-24 08:00:28.015291
110	Similar Tours Function Performance	Performance	PASS	VÃ©rification que la fonction tours similaires fonctionne	true	true	00:00:00.004297	2025-08-24 08:00:28.015291
111	Main Indexes Existence	Performance	PASS	VÃ©rification de l'existence des index principaux	true	true	00:00:00.001322	2025-08-24 08:00:28.015291
112	Table Statistics Updated	Performance	PASS	VÃ©rification que les statistiques des tables sont Ã  jour	true	true	00:00:00.002264	2025-08-24 08:00:28.015291
113	No Sensitive Data Exposed	Security	PASS	VÃ©rification qu'aucune donnÃ©e sensible n'est exposÃ©e dans les avis non approuvÃ©s	true	true	00:00:00.000678	2025-08-24 08:00:28.015291
114	Moderation Constraints	Security	PASS	VÃ©rification que tous les avis ont un statut de modÃ©ration valide	true	true	00:00:00.000524	2025-08-24 08:00:28.015291
115	Group Price Calculation	Functional	PASS	VÃ©rification que le calcul des prix de groupe fonctionne	true	true	00:00:00.002302	2025-08-24 08:00:28.015291
116	Tour Availability Check	Functional	PASS	VÃ©rification que la vÃ©rification de disponibilitÃ© fonctionne	true	true	00:00:00.002245	2025-08-24 08:00:28.015291
\.


--
-- Data for Name: tour_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_categories (id, name, slug, description, icon, color_theme, image, meta_title, meta_description, meta_keywords, is_active, is_featured, is_popular, display_order, active_tour_count, total_bookings, avg_rating, min_price, max_price, created_at, updated_at) FROM stdin;
1	Cultural Tours	cultural-tours	Explore the rich cultural heritage of South India	fa-landmark	#8B4513	\N	\N	\N	\N	t	t	f	1	1	0	4.25	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
2	Adventure Tours	adventure-tours	Thrilling adventures in nature and mountains	fa-mountain	#228B22	\N	\N	\N	\N	t	t	f	2	2	127	4.78	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
3	Beach Tours	beach-tours	Relax on pristine beaches and coastal experiences	fa-umbrella-beach	#4169E1	\N	\N	\N	\N	t	t	f	3	2	178	4.53	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
4	Wildlife Tours	wildlife-tours	Discover exotic wildlife in natural habitats	fa-paw	#32CD32	\N	\N	\N	\N	t	t	f	4	1	0	4.50	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
5	Spiritual Tours	spiritual-tours	Sacred temples and spiritual journeys	fa-om	#FF6347	\N	\N	\N	\N	t	t	f	5	1	267	4.80	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
6	Hill Station Tours	hill-station-tours	Cool retreats in scenic hill stations	fa-mountain	#9370DB	\N	\N	\N	\N	t	t	f	6	2	323	4.80	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
7	Backwater Tours	backwater-tours	Serene backwater cruises and houseboat stays	fa-ship	#20B2AA	\N	\N	\N	\N	t	f	f	7	2	0	4.50	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
8	Food Tours	food-tours	Culinary adventures and local cuisine experiences	fa-utensils	#FF4500	\N	\N	\N	\N	t	f	f	8	0	0	0.00	\N	\N	2025-08-24 08:00:19.605801	2025-08-24 08:00:27.067268
9	Heritage	heritage	Explore ancient temples, palaces, and historical monuments showcasing South India's rich cultural legacy.	monument	#007bff	\N	\N	\N	\N	t	f	f	1	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
10	Spiritual	spiritual	Discover sacred temples, ashrams, and pilgrimage sites for inner peace and spiritual awakening.	pray	#007bff	\N	\N	\N	\N	t	f	f	2	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
11	Nature & Wildlife	nature-wildlife	Experience lush Western Ghats, wildlife sanctuaries, and pristine natural landscapes.	tree	#007bff	\N	\N	\N	\N	t	f	f	3	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
12	Culinary	culinary	Savor authentic South Indian cuisine, spice tours, and traditional cooking experiences.	utensils	#007bff	\N	\N	\N	\N	t	f	f	4	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
13	Beach & Backwaters	beach-backwaters	Relax on pristine beaches and cruise through serene backwaters of Kerala and Karnataka.	umbrella-beach	#007bff	\N	\N	\N	\N	t	f	f	5	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
14	Cultural Arts	cultural-arts	Witness classical dance performances, traditional music, and local art forms.	theater-masks	#007bff	\N	\N	\N	\N	t	f	f	6	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
15	Adventure	adventure	Trek through hill stations, go white-water rafting, and explore caves and waterfalls.	mountain	#007bff	\N	\N	\N	\N	t	f	f	7	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
16	Ayurveda & Wellness	ayurveda-wellness	Rejuvenate with authentic Ayurvedic treatments, yoga retreats, and wellness programs.	spa	#007bff	\N	\N	\N	\N	t	f	f	8	0	0	0.00	\N	\N	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
\.


--
-- Data for Name: tour_destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_destinations (tour_id, destination_id, display_order, created_at) FROM stdin;
1	1	0	2025-08-23 15:26:13.662216+01
2	2	0	2025-08-23 15:26:13.662216+01
3	3	0	2025-08-23 15:26:13.662216+01
4	4	0	2025-08-23 15:26:13.662216+01
5	5	0	2025-08-23 15:26:13.662216+01
6	6	0	2025-08-23 15:26:13.662216+01
\.


--
-- Data for Name: tour_exclusions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_exclusions (id, tour_id, title, description, created_at) FROM stdin;
\.


--
-- Data for Name: tour_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_images (id, tour_id, image_url, caption, is_primary, display_order, created_at) FROM stdin;
\.


--
-- Data for Name: tour_inclusions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_inclusions (id, tour_id, inclusion_type, title, description, icon, is_included, created_at) FROM stdin;
\.


--
-- Data for Name: tour_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tour_statistics (id, tour_id, total_bookings, total_revenue, total_participants, bookings_this_month, bookings_last_month, revenue_this_month, revenue_last_month, avg_rating, total_reviews, five_star_reviews, four_star_reviews, three_star_reviews, two_star_reviews, one_star_reviews, page_views, page_views_this_month, inquiries_count, conversion_rate, wishlist_count, share_count, click_count, cancellation_rate, repeat_customer_rate, recommendation_score, peak_season_bookings, off_season_bookings, avg_booking_value, min_booking_value, max_booking_value, domestic_bookings, international_bookings, group_bookings, individual_bookings, avg_booking_lead_time, last_booking_date, first_booking_date, is_trending, is_bestseller, trend_score, last_calculated_at, created_at, updated_at) FROM stdin;
1	6	0	\N	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	0	0	0	0.00	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
2	3	0	\N	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	0	0	0	0.00	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
3	5	0	\N	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	0	0	0	0.00	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
4	1	0	\N	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	0	0	0	0.00	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
5	78	127	44448.73	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	3456	0	0	3.67	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
6	77	89	22249.11	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	2341	0	0	3.80	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
7	4	0	\N	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	0	0	0	0.00	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
8	2	0	\N	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	0	0	0	0.00	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
9	80	267	53397.33	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	5678	0	0	4.70	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
10	79	178	53398.22	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	4123	0	0	4.32	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
11	81	234	53817.66	0	0	0	0.00	0.00	0.00	0	0	0	0	0	0	4567	0	0	5.12	0	0	0	0.00	0.00	0.00	0	0	0.00	\N	\N	0	0	0	0	0	\N	\N	f	f	0.00	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268	2025-08-24 08:00:27.067268
\.


--
-- Data for Name: touraddons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.touraddons (tour_id, addon_id) FROM stdin;
\.


--
-- Data for Name: tours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tours (id, name, main_image_url, itinerary, is_active, category, destinations, slug, themes, rating, review_count, is_new, created_at, updated_at, category_id, is_featured, is_bestseller, is_trending, display_order, short_description, highlights, inclusions, exclusions, min_age, max_group_size, languages, original_price, discount_percentage, early_bird_discount, group_discount_threshold, group_discount_percentage, available_from, available_until, blackout_dates, seasonal_pricing, gallery_images, video_url, virtual_tour_url, thumbnail_image, view_count, booking_count, wishlist_count, avg_rating, meta_title, meta_description, meta_keywords, canonical_url, starting_location, ending_location, coordinates, covered_destinations, cancellation_policy, booking_terms, what_to_bring, important_notes, eco_friendly, cultural_immersion, family_friendly, adventure_level) FROM stdin;
6	Goa Beach Paradise	https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800	\N	t	\N	\N	\N	{Beach,Adventure,Nightlife}	4.25	4	f	2025-08-18 15:26:13.661	2025-08-24 08:00:21.520354	3	t	f	f	0	\N	\N	\N	\N	0	15	English, Hindi	\N	0.00	0.00	4	0.00	\N	\N	[]	{}	\N	\N	\N	\N	0	0	0	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	low
3	Munnar Tea Plantation Trek	https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800	\N	t	\N	\N	\N	{Adventure,Nature,Cuisine}	4.75	4	f	2025-07-24 15:26:13.661	2025-08-24 07:31:36.135529	2	t	f	f	0	\N	\N	\N	\N	0	15	English, Hindi	\N	0.00	0.00	4	0.00	\N	\N	[]	{}	\N	\N	\N	\N	0	0	0	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	low
5	Thekkady Wildlife Safari	https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800	\N	t	\N	\N	\N	{Wildlife,Adventure,Nature}	4.50	4	f	2025-08-03 15:26:13.661	2025-08-24 07:31:36.135529	4	t	f	f	0	\N	\N	\N	\N	0	15	English, Hindi	\N	0.00	0.00	4	0.00	\N	\N	[]	{}	\N	\N	\N	\N	0	0	0	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	low
1	Kanyakumari Sunrise Spectacle	https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800	\N	t	\N	\N	\N	{Cultural,Photography,Nature}	4.25	4	f	2025-07-09 15:26:13.661	2025-08-24 07:31:36.135529	1	t	f	f	0	\N	\N	\N	\N	0	15	English, Hindi	\N	0.00	0.00	4	0.00	\N	\N	[]	{}	\N	\N	\N	\N	0	0	0	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	low
78	Mysore Palace & Hampi Heritage - 5 Days	\N	\N	t	\N	\N	mysore-palace-hampi-heritage	\N	4.80	203	f	2025-08-24 07:31:41.594133	2025-08-24 08:00:21.520354	2	t	f	t	2	Complete heritage tour showcasing Karnataka's royal palaces and ancient Hampi ruins.	{"Mysore Palace illumination","Hampi UNESCO World Heritage site","Virupaksha Temple complex","Srirangapatna fort","Brindavan Gardens"}	{"4 nights hotel accommodation","Daily breakfast","Professional heritage guide","All transportation","Entry tickets included"}	{"International flights","Lunch and dinner","Personal shopping","Camera fees at monuments"}	18	8	English	349.99	0.00	0.00	4	0.00	\N	\N	[]	{}	{/images/tours/karnataka-1.jpg,/images/tours/karnataka-2.jpg,/images/tours/karnataka-3.jpg,/images/tours/karnataka-4.jpg}	\N	\N	/images/tours/karnataka-heritage-thumb.jpg	3456	127	0	4.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"Comfortable walking shoes","Modest clothing for temples","Water bottle","Sun protection"}	{"Remove shoes at temple entrances","Photography restrictions in some areas"}	f	f	f	low
77	Kerala Backwaters & Spice Gardens - 4 Days	\N	\N	t	\N	\N	kerala-backwaters-spice-gardens	\N	4.80	156	f	2025-08-24 07:31:41.594133	2025-08-24 08:00:21.520354	6	t	t	f	1	Magical houseboat journey through Kerala's backwaters with spice plantation tours and wildlife encounters.	{"Traditional houseboat cruise","Spice plantation tour in Thekkady","Periyar Wildlife Sanctuary","Kathakali dance performance","Ayurvedic massage session"}	{"3 nights accommodation","All meals on houseboat","English-speaking guide","Entry fees to attractions","Traditional Kerala breakfast"}	{"International flights","Personal expenses","Travel insurance","Tips and gratuities"}	16	12	English	249.99	0.00	0.00	4	0.00	\N	\N	[]	{}	{/images/tours/kerala-1.jpg,/images/tours/kerala-2.jpg,/images/tours/kerala-3.jpg}	\N	\N	/images/tours/kerala-backwaters-thumb.jpg	2341	89	0	4.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"Comfortable walking shoes","Light cotton clothing","Sunscreen and hat","Insect repellent"}	{"Advance booking required 48 hours","Free cancellation up to 24 hours before"}	f	f	f	low
4	Alleppey Houseboat Experience	https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800	\N	t	\N	\N	\N	{Luxury,Culture,Relaxation}	4.75	4	f	2025-07-29 15:26:13.661	2025-08-24 07:31:36.135529	7	t	f	f	0	\N	\N	\N	\N	0	15	English, Hindi	\N	0.00	0.00	4	0.00	\N	\N	[]	{}	\N	\N	\N	\N	0	0	0	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	low
2	Cochin Backwater Cruise	https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800	\N	t	\N	\N	\N	{Luxury,Nature,Cuisine}	4.25	4	f	2025-07-16 15:26:13.661	2025-08-24 07:31:36.135529	7	t	f	f	0	\N	\N	\N	\N	0	15	English, Hindi	\N	0.00	0.00	4	0.00	\N	\N	[]	{}	\N	\N	\N	\N	0	0	0	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	t	low
80	Hyderabad Heritage & Cuisine - 3 Days	\N	\N	t	\N	\N	hyderabad-heritage-cuisine	\N	4.80	445	t	2025-08-24 07:31:41.594133	2025-08-24 08:00:21.520354	5	t	t	f	4	Cultural immersion in Hyderabad's Nizami heritage with authentic culinary experiences.	{"Charminar and Laad Bazaar","Chowmahalla Palace tour","Authentic biryani cooking class","Golconda Fort sunset","Salar Jung Museum"}	{"2 nights city hotel","Daily breakfast","Food tour guide","Cooking class session","All entry tickets"}	{"International flights","Lunch and dinner (except food tour)","Personal shopping","Tips for guides"}	14	15	English	199.99	0.00	0.00	4	0.00	\N	\N	[]	{}	{/images/tours/hyderabad-1.jpg,/images/tours/hyderabad-2.jpg,/images/tours/hyderabad-3.jpg,/images/tours/hyderabad-4.jpg}	\N	\N	/images/tours/hyderabad-heritage-thumb.jpg	5678	267	0	4.60	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"Comfortable walking shoes","Light clothing",Camera,"Appetite for spicy food"}	{"Spicy food - inform about dietary restrictions","Busy markets - stay with group"}	f	f	f	low
79	Tamil Nadu Temple Trail - 6 Days	\N	\N	t	\N	\N	tamil-nadu-temple-trail	\N	4.80	298	f	2025-08-24 07:31:41.594133	2025-08-24 08:00:21.520354	3	t	t	t	3	Sacred temple pilgrimage showcasing Dravidian architecture and Tamil cultural traditions.	{"Meenakshi Amman Temple Madurai","Brihadeeswarar Temple Thanjavur","Bharatanatyam dance performance","Rameswaram pilgrimage","Chettinad cuisine experience"}	{"5 nights accommodation","Daily breakfast","Temple guide services","Air-conditioned transport","Cultural show tickets"}	{"International flights","Meals except breakfast","Personal donations at temples","Shopping expenses"}	16	10	English	299.99	0.00	0.00	4	0.00	\N	\N	[]	{}	{/images/tours/tamilnadu-1.jpg,/images/tours/tamilnadu-2.jpg,/images/tours/tamilnadu-3.jpg}	\N	\N	/images/tours/tamilnadu-temples-thumb.jpg	4123	178	0	4.70	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"Modest temple attire","Comfortable sandals","Respectful behavior","Small bag for temple visits"}	{"Dress code strictly enforced","Remove leather items before entering temples"}	f	f	f	low
81	Goa Beach & Portuguese Heritage - 4 Days	\N	\N	t	\N	\N	goa-beach-portuguese-heritage	\N	4.80	367	f	2025-08-24 07:31:41.594133	2025-08-24 08:00:21.520354	6	t	t	f	5	Perfect blend of beach relaxation and Portuguese colonial heritage exploration.	{"Basilica of Bom Jesus","Calangute and Baga beaches","Spice plantation tour","Dudhsagar waterfalls","Sunset cruise on Mandovi River"}	{"3 nights beach resort","Daily breakfast","Heritage guide","Beach activities","River cruise"}	{"International flights","Meals except breakfast","Water sports","Personal expenses"}	16	12	English	229.99	0.00	0.00	4	0.00	\N	\N	[]	{}	{/images/tours/goa-1.jpg,/images/tours/goa-2.jpg,/images/tours/goa-3.jpg}	\N	\N	/images/tours/goa-heritage-thumb.jpg	4567	234	0	4.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"Beach wear",Sunscreen,"Comfortable sandals","Light cotton clothes"}	{"Respect local customs","Stay hydrated in tropical climate"}	f	f	f	low
\.


--
-- Data for Name: user_favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_favorites (id, user_id, tour_id, created_at) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_preferences (id, user_id, preference_key, preference_value, data_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, password, role, is_verified, verification_token, phone, country, creation_date, recent_activities, activity_count, is_active, last_login, profile_image_url, preferences) FROM stdin;
1	Test User 1	user1@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543201	India	2025-08-21 15:26:13.662216+01	\N	0	t	\N	\N	\N
2	Test User 2	user2@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543202	India	2025-08-19 15:26:13.662216+01	\N	0	t	\N	\N	\N
3	Test User 3	user3@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543203	India	2025-08-17 15:26:13.662216+01	\N	0	t	\N	\N	\N
4	Test User 4	user4@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543204	India	2025-08-15 15:26:13.662216+01	\N	0	t	\N	\N	\N
5	Test User 5	user5@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543205	India	2025-08-13 15:26:13.662216+01	\N	0	t	\N	\N	\N
6	Test User 6	user6@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543206	India	2025-08-11 15:26:13.662216+01	\N	0	t	\N	\N	\N
7	Test User 7	user7@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543207	India	2025-08-09 15:26:13.662216+01	\N	0	t	\N	\N	\N
8	Test User 8	user8@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543208	India	2025-08-07 15:26:13.662216+01	\N	0	t	\N	\N	\N
9	Test User 9	user9@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543209	India	2025-08-05 15:26:13.662216+01	\N	0	t	\N	\N	\N
10	Test User 10	user10@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543210	India	2025-08-03 15:26:13.662216+01	\N	0	t	\N	\N	\N
11	Test User 11	user11@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543211	India	2025-08-01 15:26:13.662216+01	\N	0	t	\N	\N	\N
12	Test User 12	user12@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543212	India	2025-07-30 15:26:13.662216+01	\N	0	t	\N	\N	\N
13	Test User 13	user13@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543213	India	2025-07-28 15:26:13.662216+01	\N	0	t	\N	\N	\N
14	Test User 14	user14@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543214	India	2025-07-26 15:26:13.662216+01	\N	0	t	\N	\N	\N
15	Test User 15	user15@test.com	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	t	\N	+919876543215	India	2025-07-24 15:26:13.662216+01	\N	0	t	\N	\N	\N
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, name, capacity, price_per_day) FROM stdin;
\.


--
-- Name: addons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.addons_id_seq', 1, false);


--
-- Name: analytics_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.analytics_events_id_seq', 1, false);


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: auditlogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditlogs_id_seq', 1, false);


--
-- Name: blog_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_categories_id_seq', 1, false);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 112, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 30, true);


--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_inquiries_id_seq', 1, false);


--
-- Name: dashboard_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_metrics_id_seq', 1, false);


--
-- Name: destination_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destination_categories_id_seq', 1, false);


--
-- Name: destination_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destination_likes_id_seq', 1, false);


--
-- Name: destination_seasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destination_seasons_id_seq', 1, false);


--
-- Name: destinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.destinations_id_seq', 286, true);


--
-- Name: featured_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.featured_reviews_id_seq', 11, true);


--
-- Name: homepage_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.homepage_settings_id_seq', 15, true);


--
-- Name: inclusions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inclusions_id_seq', 1, false);


--
-- Name: migration_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migration_log_id_seq', 2768, true);


--
-- Name: notification_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_templates_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: packagetiers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.packagetiers_id_seq', 18, true);


--
-- Name: passwordresets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.passwordresets_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 30, true);


--
-- Name: review_helpfulness_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_helpfulness_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 24, true);


--
-- Name: special_offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.special_offers_id_seq', 6, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 1, false);


--
-- Name: test_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.test_results_id_seq', 116, true);


--
-- Name: tour_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tour_categories_id_seq', 16, true);


--
-- Name: tour_exclusions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tour_exclusions_id_seq', 1, false);


--
-- Name: tour_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tour_images_id_seq', 1, false);


--
-- Name: tour_inclusions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tour_inclusions_id_seq', 1, false);


--
-- Name: tour_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tour_statistics_id_seq', 11, true);


--
-- Name: tours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tours_id_seq', 176, true);


--
-- Name: user_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_favorites_id_seq', 1, false);


--
-- Name: user_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_preferences_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 1, false);


--
-- Name: addons addons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: articles articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: auditlogs auditlogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditlogs
    ADD CONSTRAINT auditlogs_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- Name: blog_post_categories blog_post_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_pkey PRIMARY KEY (blog_post_id, category_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: contact_inquiries contact_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_inquiries
    ADD CONSTRAINT contact_inquiries_pkey PRIMARY KEY (id);


--
-- Name: dashboard_metrics dashboard_metrics_metric_name_metric_date_period_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_metrics
    ADD CONSTRAINT dashboard_metrics_metric_name_metric_date_period_type_key UNIQUE (metric_name, metric_date, period_type);


--
-- Name: dashboard_metrics dashboard_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_metrics
    ADD CONSTRAINT dashboard_metrics_pkey PRIMARY KEY (id);


--
-- Name: destination_categories destination_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_categories
    ADD CONSTRAINT destination_categories_name_key UNIQUE (name);


--
-- Name: destination_categories destination_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_categories
    ADD CONSTRAINT destination_categories_pkey PRIMARY KEY (id);


--
-- Name: destination_categories destination_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_categories
    ADD CONSTRAINT destination_categories_slug_key UNIQUE (slug);


--
-- Name: destination_category_assignments destination_category_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_category_assignments
    ADD CONSTRAINT destination_category_assignments_pkey PRIMARY KEY (destination_id, category_id);


--
-- Name: destination_likes destination_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_likes
    ADD CONSTRAINT destination_likes_pkey PRIMARY KEY (id);


--
-- Name: destination_likes destination_likes_user_id_destination_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_likes
    ADD CONSTRAINT destination_likes_user_id_destination_id_key UNIQUE (user_id, destination_id);


--
-- Name: destination_seasons destination_seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_seasons
    ADD CONSTRAINT destination_seasons_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_name_key UNIQUE (name);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_slug_key UNIQUE (slug);


--
-- Name: featured_reviews featured_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.featured_reviews
    ADD CONSTRAINT featured_reviews_pkey PRIMARY KEY (id);


--
-- Name: gallery_images gallery_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_images
    ADD CONSTRAINT gallery_images_pkey PRIMARY KEY (id);


--
-- Name: homepage_settings homepage_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homepage_settings
    ADD CONSTRAINT homepage_settings_pkey PRIMARY KEY (id);


--
-- Name: homepage_settings homepage_settings_section_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.homepage_settings
    ADD CONSTRAINT homepage_settings_section_name_key UNIQUE (section_name);


--
-- Name: inclusions inclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inclusions
    ADD CONSTRAINT inclusions_pkey PRIMARY KEY (id);


--
-- Name: migration_log migration_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migration_log
    ADD CONSTRAINT migration_log_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_name_key UNIQUE (name);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: packagetiers packagetiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packagetiers
    ADD CONSTRAINT packagetiers_pkey PRIMARY KEY (id);


--
-- Name: passwordresets passwordresets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passwordresets
    ADD CONSTRAINT passwordresets_pkey PRIMARY KEY (id);


--
-- Name: payments payments_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_key UNIQUE (booking_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: review_helpfulness review_helpfulness_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_pkey PRIMARY KEY (id);


--
-- Name: review_helpfulness review_helpfulness_review_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_review_id_user_id_key UNIQUE (review_id, user_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: special_offers special_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_offers
    ADD CONSTRAINT special_offers_pkey PRIMARY KEY (id);


--
-- Name: special_offers special_offers_promo_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_offers
    ADD CONSTRAINT special_offers_promo_code_key UNIQUE (promo_code);


--
-- Name: special_offers special_offers_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_offers
    ADD CONSTRAINT special_offers_slug_key UNIQUE (slug);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: test_results test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_pkey PRIMARY KEY (id);


--
-- Name: tour_categories tour_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_categories
    ADD CONSTRAINT tour_categories_name_key UNIQUE (name);


--
-- Name: tour_categories tour_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_categories
    ADD CONSTRAINT tour_categories_pkey PRIMARY KEY (id);


--
-- Name: tour_categories tour_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_categories
    ADD CONSTRAINT tour_categories_slug_key UNIQUE (slug);


--
-- Name: tour_destinations tour_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_destinations
    ADD CONSTRAINT tour_destinations_pkey PRIMARY KEY (tour_id, destination_id);


--
-- Name: tour_exclusions tour_exclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_exclusions
    ADD CONSTRAINT tour_exclusions_pkey PRIMARY KEY (id);


--
-- Name: tour_images tour_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_images
    ADD CONSTRAINT tour_images_pkey PRIMARY KEY (id);


--
-- Name: tour_inclusions tour_inclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_inclusions
    ADD CONSTRAINT tour_inclusions_pkey PRIMARY KEY (id);


--
-- Name: tour_statistics tour_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_statistics
    ADD CONSTRAINT tour_statistics_pkey PRIMARY KEY (id);


--
-- Name: touraddons touraddons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.touraddons
    ADD CONSTRAINT touraddons_pkey PRIMARY KEY (tour_id, addon_id);


--
-- Name: tours tours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_pkey PRIMARY KEY (id);


--
-- Name: tours tours_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_slug_key UNIQUE (slug);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (id);


--
-- Name: user_favorites user_favorites_user_id_tour_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_tour_id_key UNIQUE (user_id, tour_id);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_preferences user_preferences_user_id_preference_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_preference_key_key UNIQUE (user_id, preference_key);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: idx_analytics_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_date ON public.analytics_events USING btree (created_at DESC);


--
-- Name: idx_analytics_events_session; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_session ON public.analytics_events USING btree (session_id);


--
-- Name: idx_analytics_events_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_type ON public.analytics_events USING btree (event_type);


--
-- Name: idx_analytics_events_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_events_user ON public.analytics_events USING btree (user_id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_admin_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_admin_user ON public.audit_logs USING btree (admin_user_id);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (target_entity, entity_id);


--
-- Name: idx_audit_logs_ip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_ip ON public.audit_logs USING btree (ip_address);


--
-- Name: idx_audit_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp" DESC);


--
-- Name: idx_blog_posts_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_author ON public.blog_posts USING btree (author_id);


--
-- Name: idx_blog_posts_by_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_by_category ON public.blog_posts USING btree (category, published_at DESC, view_count DESC) WHERE (is_published = true);


--
-- Name: idx_blog_posts_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_category ON public.blog_posts USING btree (category);


--
-- Name: idx_blog_posts_category_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_category_published ON public.blog_posts USING btree (category, is_published, published_at DESC) WHERE (is_published = true);


--
-- Name: idx_blog_posts_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_display_order ON public.blog_posts USING btree (display_order);


--
-- Name: idx_blog_posts_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_featured ON public.blog_posts USING btree (is_featured);


--
-- Name: idx_blog_posts_featured_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_featured_rating ON public.blog_posts USING btree (is_featured, avg_rating DESC) WHERE (is_featured = true);


--
-- Name: idx_blog_posts_fulltext_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_fulltext_search ON public.blog_posts USING gin (to_tsvector('english'::regconfig, (((((title)::text || ' '::text) || COALESCE(content, ''::text)) || ' '::text) || COALESCE(excerpt, ''::text)))) WHERE (is_published = true);


--
-- Name: idx_blog_posts_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_language ON public.blog_posts USING btree (language);


--
-- Name: idx_blog_posts_moderation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_moderation ON public.blog_posts USING btree (moderation_status);


--
-- Name: idx_blog_posts_popular; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_popular ON public.blog_posts USING btree (view_count DESC, like_count DESC, published_at DESC) WHERE (is_published = true);


--
-- Name: idx_blog_posts_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_published ON public.blog_posts USING btree (published_at DESC);


--
-- Name: idx_blog_posts_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_published_at ON public.blog_posts USING btree (published_at DESC);


--
-- Name: idx_blog_posts_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_rating ON public.blog_posts USING btree (avg_rating DESC, rating_count DESC);


--
-- Name: idx_blog_posts_related_destinations; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_related_destinations ON public.blog_posts USING gin (related_destinations) WHERE (related_destinations IS NOT NULL);


--
-- Name: idx_blog_posts_related_tours; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_related_tours ON public.blog_posts USING gin (related_tours) WHERE (related_tours IS NOT NULL);


--
-- Name: idx_blog_posts_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_search ON public.blog_posts USING gin (to_tsvector('english'::regconfig, (((((title)::text || ' '::text) || COALESCE(content, ''::text)) || ' '::text) || COALESCE(excerpt, ''::text))));


--
-- Name: idx_blog_posts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_status ON public.blog_posts USING btree (status);


--
-- Name: idx_blog_posts_tags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING gin (tags);


--
-- Name: idx_blog_posts_tags_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_tags_search ON public.blog_posts USING gin (tags) WHERE ((is_published = true) AND (tags IS NOT NULL));


--
-- Name: idx_blog_posts_view_count; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_view_count ON public.blog_posts USING btree (view_count DESC);


--
-- Name: idx_bookings_cancelled_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_cancelled_at ON public.bookings USING btree (cancelled_at);


--
-- Name: idx_bookings_confirmed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_confirmed_at ON public.bookings USING btree (confirmed_at);


--
-- Name: idx_bookings_inquiry_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bookings_inquiry_date ON public.bookings USING btree (inquiry_date DESC);


--
-- Name: idx_categories_active_only; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_active_only ON public.tour_categories USING btree (id, name, slug, display_order) WHERE (is_active = true);


--
-- Name: idx_contact_inquiries_assigned; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_inquiries_assigned ON public.contact_inquiries USING btree (assigned_to);


--
-- Name: idx_contact_inquiries_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_inquiries_date ON public.contact_inquiries USING btree (created_at DESC);


--
-- Name: idx_contact_inquiries_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_inquiries_priority ON public.contact_inquiries USING btree (priority);


--
-- Name: idx_contact_inquiries_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries USING btree (status);


--
-- Name: idx_contact_inquiries_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_inquiries_type ON public.contact_inquiries USING btree (inquiry_type);


--
-- Name: idx_dashboard_metrics_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dashboard_metrics_date ON public.dashboard_metrics USING btree (metric_date DESC);


--
-- Name: idx_dashboard_metrics_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dashboard_metrics_name ON public.dashboard_metrics USING btree (metric_name);


--
-- Name: idx_dashboard_metrics_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dashboard_metrics_period ON public.dashboard_metrics USING btree (period_type);


--
-- Name: idx_destination_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destination_categories_slug ON public.destination_categories USING btree (slug);


--
-- Name: idx_destination_likes_destination_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destination_likes_destination_id ON public.destination_likes USING btree (destination_id);


--
-- Name: idx_destination_likes_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destination_likes_user_id ON public.destination_likes USING btree (user_id);


--
-- Name: idx_destination_seasons_destination_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destination_seasons_destination_id ON public.destination_seasons USING btree (destination_id);


--
-- Name: idx_destination_seasons_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destination_seasons_season ON public.destination_seasons USING btree (season);


--
-- Name: idx_destinations_activities; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_activities ON public.destinations USING gin (activities) WHERE (activities IS NOT NULL);


--
-- Name: idx_destinations_attractions; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_attractions ON public.destinations USING gin (top_attractions) WHERE (top_attractions IS NOT NULL);


--
-- Name: idx_destinations_bookings; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_bookings ON public.destinations USING btree (total_bookings DESC);


--
-- Name: idx_destinations_budget; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_budget ON public.destinations USING btree (budget_category);


--
-- Name: idx_destinations_budget_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_budget_rating ON public.destinations USING btree (budget_category, avg_rating DESC);


--
-- Name: idx_destinations_country; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_country ON public.destinations USING btree (country);


--
-- Name: idx_destinations_country_state; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_country_state ON public.destinations USING btree (country, state);


--
-- Name: idx_destinations_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_display_order ON public.destinations USING btree (display_order);


--
-- Name: idx_destinations_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_featured ON public.destinations USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_destinations_fulltext_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_fulltext_search ON public.destinations USING gin (to_tsvector('english'::regconfig, (((((name)::text || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || COALESCE(short_description, ''::text))));


--
-- Name: idx_destinations_homepage_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_homepage_featured ON public.destinations USING btree (is_featured, display_order, avg_rating DESC) WHERE (is_featured = true);


--
-- Name: idx_destinations_homepage_popular; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_homepage_popular ON public.destinations USING btree (is_popular, tour_count DESC, avg_rating DESC) WHERE (is_popular = true);


--
-- Name: idx_destinations_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_is_active ON public.destinations USING btree (is_active);


--
-- Name: idx_destinations_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_location ON public.destinations USING btree (latitude, longitude) WHERE ((latitude IS NOT NULL) AND (longitude IS NOT NULL));


--
-- Name: idx_destinations_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_name ON public.destinations USING btree (name);


--
-- Name: idx_destinations_nearby; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_nearby ON public.destinations USING gin (nearby_destinations) WHERE (nearby_destinations IS NOT NULL);


--
-- Name: idx_destinations_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_parent ON public.destinations USING btree (parent_destination_id) WHERE (parent_destination_id IS NOT NULL);


--
-- Name: idx_destinations_popular; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_popular ON public.destinations USING btree (is_popular) WHERE (is_popular = true);


--
-- Name: idx_destinations_popular_trending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_popular_trending ON public.destinations USING btree (is_popular, is_trending) WHERE ((is_popular = true) OR (is_trending = true));


--
-- Name: idx_destinations_price_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_price_range ON public.destinations USING btree (price_range_min, price_range_max);


--
-- Name: idx_destinations_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_rating ON public.destinations USING btree (avg_rating DESC, review_count DESC);


--
-- Name: idx_destinations_related; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_related ON public.destinations USING gin (related_destinations) WHERE (related_destinations IS NOT NULL);


--
-- Name: idx_destinations_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_search ON public.destinations USING gin (to_tsvector('english'::regconfig, (((((name)::text || ' '::text) || COALESCE(description, ''::text)) || ' '::text) || COALESCE(short_description, ''::text))));


--
-- Name: idx_destinations_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_slug ON public.destinations USING btree (slug);


--
-- Name: idx_destinations_state_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_state_featured ON public.destinations USING btree (state, is_featured) WHERE (is_featured = true);


--
-- Name: idx_destinations_top_rated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_top_rated ON public.destinations USING btree (avg_rating DESC, review_count DESC, tour_count DESC) WHERE (tour_count > 0);


--
-- Name: idx_destinations_tour_count; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_tour_count ON public.destinations USING btree (tour_count DESC);


--
-- Name: idx_destinations_trending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_trending ON public.destinations USING btree (is_trending) WHERE (is_trending = true);


--
-- Name: idx_destinations_with_tours; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_destinations_with_tours ON public.destinations USING btree (id, name, slug) WHERE (tour_count > 0);


--
-- Name: idx_featured_reviews_by_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_by_rating ON public.featured_reviews USING btree (rating DESC, helpful_votes DESC, created_at DESC) WHERE ((moderation_status)::text = 'approved'::text);


--
-- Name: idx_featured_reviews_by_tour; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_by_tour ON public.featured_reviews USING btree (tour_id, rating DESC, created_at DESC, helpful_votes DESC) WHERE ((moderation_status)::text = 'approved'::text);


--
-- Name: idx_featured_reviews_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_display_order ON public.featured_reviews USING btree (display_order);


--
-- Name: idx_featured_reviews_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_featured ON public.featured_reviews USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_featured_reviews_homepage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_homepage ON public.featured_reviews USING btree (is_homepage_highlight) WHERE (is_homepage_highlight = true);


--
-- Name: idx_featured_reviews_moderation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_moderation ON public.featured_reviews USING btree (moderation_status);


--
-- Name: idx_featured_reviews_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_rating ON public.featured_reviews USING btree (rating DESC);


--
-- Name: idx_featured_reviews_review_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_review_date ON public.featured_reviews USING btree (review_date DESC);


--
-- Name: idx_featured_reviews_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_search ON public.featured_reviews USING gin (to_tsvector('english'::regconfig, (((title)::text || ' '::text) || review_text)));


--
-- Name: idx_featured_reviews_sentiment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_sentiment ON public.featured_reviews USING btree (sentiment_score DESC) WHERE (sentiment_score IS NOT NULL);


--
-- Name: idx_featured_reviews_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_source ON public.featured_reviews USING btree (review_source);


--
-- Name: idx_featured_reviews_tour_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_tour_id ON public.featured_reviews USING btree (tour_id) WHERE (tour_id IS NOT NULL);


--
-- Name: idx_featured_reviews_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_featured_reviews_verified ON public.featured_reviews USING btree (is_verified) WHERE (is_verified = true);


--
-- Name: idx_gallery_aspect_ratio; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_aspect_ratio ON public.gallery_images USING btree (aspect_ratio);


--
-- Name: idx_gallery_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_category ON public.gallery_images USING btree (category);


--
-- Name: idx_gallery_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_created_at ON public.gallery_images USING btree (created_at);


--
-- Name: idx_gallery_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_date ON public.gallery_images USING btree (date);


--
-- Name: idx_gallery_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_featured ON public.gallery_images USING btree (is_featured);


--
-- Name: idx_gallery_tags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_tags ON public.gallery_images USING gin (tags);


--
-- Name: idx_gallery_views; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_views ON public.gallery_images USING btree (views);


--
-- Name: idx_homepage_settings_ab_test; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_homepage_settings_ab_test ON public.homepage_settings USING btree (ab_test_variant, ab_test_active) WHERE (ab_test_active = true);


--
-- Name: idx_homepage_settings_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_homepage_settings_active ON public.homepage_settings USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_homepage_settings_cache_refresh; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_homepage_settings_cache_refresh ON public.homepage_settings USING btree (last_cache_refresh);


--
-- Name: idx_homepage_settings_config; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_homepage_settings_config ON public.homepage_settings USING gin (section_config);


--
-- Name: idx_homepage_settings_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_homepage_settings_display_order ON public.homepage_settings USING btree (display_order);


--
-- Name: idx_homepage_settings_section_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_homepage_settings_section_name ON public.homepage_settings USING btree (section_name);


--
-- Name: idx_homepage_settings_section_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_homepage_settings_section_type ON public.homepage_settings USING btree (section_type);


--
-- Name: idx_migration_log_execution_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_migration_log_execution_time ON public.migration_log USING btree (execution_time);


--
-- Name: idx_migration_log_script_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_migration_log_script_name ON public.migration_log USING btree (script_name);


--
-- Name: idx_migration_log_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_migration_log_status ON public.migration_log USING btree (status);


--
-- Name: idx_mv_homepage_statistics_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_mv_homepage_statistics_entity ON public.mv_homepage_statistics USING btree (entity_type);


--
-- Name: idx_notifications_channel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_channel ON public.notifications USING btree (channel);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_priority ON public.notifications USING btree (priority);


--
-- Name: idx_notifications_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_scheduled ON public.notifications USING btree (scheduled_at);


--
-- Name: idx_notifications_sent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_sent ON public.notifications USING btree (sent_at);


--
-- Name: idx_notifications_template; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_template ON public.notifications USING btree (template_id);


--
-- Name: idx_notifications_user_sent_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_sent_at ON public.notifications USING btree (user_id, sent_at DESC);


--
-- Name: idx_reviews_helpful_count; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_helpful_count ON public.reviews USING btree (helpful_count DESC);


--
-- Name: idx_reviews_tour_join; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_tour_join ON public.featured_reviews USING btree (tour_id, moderation_status, rating, created_at);


--
-- Name: idx_reviews_travel_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_travel_date ON public.reviews USING btree (travel_date);


--
-- Name: idx_reviews_verified_purchase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_verified_purchase ON public.reviews USING btree (verified_purchase);


--
-- Name: idx_special_offers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_active ON public.special_offers USING btree (is_active);


--
-- Name: idx_special_offers_active_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_active_dates ON public.special_offers USING btree (is_active, valid_from, valid_until) WHERE (is_active = true);


--
-- Name: idx_special_offers_by_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_by_type ON public.special_offers USING btree (offer_type, discount_percentage DESC, discount_amount DESC, valid_until) WHERE (is_active = true);


--
-- Name: idx_special_offers_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_display_order ON public.special_offers USING btree (display_order);


--
-- Name: idx_special_offers_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_featured ON public.special_offers USING btree (is_featured);


--
-- Name: idx_special_offers_homepage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_homepage ON public.special_offers USING btree (display_order, discount_percentage DESC, discount_amount DESC) WHERE (is_active = true);


--
-- Name: idx_special_offers_homepage_banner; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_homepage_banner ON public.special_offers USING btree (is_homepage_banner);


--
-- Name: idx_special_offers_offer_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_offer_type ON public.special_offers USING btree (offer_type);


--
-- Name: idx_special_offers_promo_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_promo_code ON public.special_offers USING btree (promo_code) WHERE (promo_code IS NOT NULL);


--
-- Name: idx_special_offers_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_slug ON public.special_offers USING btree (slug);


--
-- Name: idx_special_offers_type_value; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_type_value ON public.special_offers USING btree (offer_type, discount_percentage DESC) WHERE (is_active = true);


--
-- Name: idx_special_offers_valid_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_special_offers_valid_period ON public.special_offers USING btree (valid_from, valid_until);


--
-- Name: idx_system_settings_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_settings_key ON public.system_settings USING btree (setting_key);


--
-- Name: idx_system_settings_public; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_settings_public ON public.system_settings USING btree (is_public);


--
-- Name: idx_tour_categories_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_categories_active ON public.tour_categories USING btree (is_active);


--
-- Name: idx_tour_categories_active_tours; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_categories_active_tours ON public.tour_categories USING btree (active_tour_count DESC);


--
-- Name: idx_tour_categories_avg_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_categories_avg_rating ON public.tour_categories USING btree (avg_rating DESC);


--
-- Name: idx_tour_categories_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_categories_display_order ON public.tour_categories USING btree (display_order);


--
-- Name: idx_tour_categories_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_categories_featured ON public.tour_categories USING btree (is_featured);


--
-- Name: idx_tour_categories_popular; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_categories_popular ON public.tour_categories USING btree (is_popular);


--
-- Name: idx_tour_categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_categories_slug ON public.tour_categories USING btree (slug);


--
-- Name: idx_tour_destinations_destination_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_destinations_destination_id ON public.tour_destinations USING btree (destination_id);


--
-- Name: idx_tour_destinations_tour_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_destinations_tour_id ON public.tour_destinations USING btree (tour_id);


--
-- Name: idx_tour_exclusions_tour; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_exclusions_tour ON public.tour_exclusions USING btree (tour_id);


--
-- Name: idx_tour_images_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_images_order ON public.tour_images USING btree (display_order);


--
-- Name: idx_tour_images_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_images_primary ON public.tour_images USING btree (is_primary);


--
-- Name: idx_tour_images_tour; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_images_tour ON public.tour_images USING btree (tour_id);


--
-- Name: idx_tour_inclusions_tour; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_inclusions_tour ON public.tour_inclusions USING btree (tour_id);


--
-- Name: idx_tour_inclusions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_inclusions_type ON public.tour_inclusions USING btree (inclusion_type);


--
-- Name: idx_tour_statistics_avg_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_avg_rating ON public.tour_statistics USING btree (avg_rating DESC);


--
-- Name: idx_tour_statistics_bestseller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_bestseller ON public.tour_statistics USING btree (is_bestseller) WHERE (is_bestseller = true);


--
-- Name: idx_tour_statistics_conversion_rate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_conversion_rate ON public.tour_statistics USING btree (conversion_rate DESC);


--
-- Name: idx_tour_statistics_last_calculated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_last_calculated ON public.tour_statistics USING btree (last_calculated_at);


--
-- Name: idx_tour_statistics_total_bookings; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_total_bookings ON public.tour_statistics USING btree (total_bookings DESC);


--
-- Name: idx_tour_statistics_total_revenue; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_total_revenue ON public.tour_statistics USING btree (total_revenue DESC);


--
-- Name: idx_tour_statistics_tour_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_tour_statistics_tour_id ON public.tour_statistics USING btree (tour_id);


--
-- Name: idx_tour_statistics_trend_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_trend_score ON public.tour_statistics USING btree (trend_score DESC);


--
-- Name: idx_tour_statistics_trending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tour_statistics_trending ON public.tour_statistics USING btree (is_trending) WHERE (is_trending = true);


--
-- Name: idx_tours_active_only; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_active_only ON public.tours USING btree (id, name, original_price, rating) WHERE (is_active = true);


--
-- Name: idx_tours_age_requirement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_age_requirement ON public.tours USING btree (min_age) WHERE (is_active = true);


--
-- Name: idx_tours_availability; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_availability ON public.tours USING btree (available_from, available_until);


--
-- Name: idx_tours_availability_period; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_availability_period ON public.tours USING btree (available_from, available_until, is_active) WHERE (is_active = true);


--
-- Name: idx_tours_bestseller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_bestseller ON public.tours USING btree (is_bestseller) WHERE (is_bestseller = true);


--
-- Name: idx_tours_bestseller_trending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_bestseller_trending ON public.tours USING btree (is_bestseller, is_trending) WHERE ((is_bestseller = true) OR (is_trending = true));


--
-- Name: idx_tours_by_category_homepage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_by_category_homepage ON public.tours USING btree (category_id, is_active, rating DESC, booking_count DESC) WHERE (is_active = true);


--
-- Name: idx_tours_category_aggregation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_category_aggregation ON public.tours USING btree (category_id, rating, booking_count, original_price) WHERE (is_active = true);


--
-- Name: idx_tours_category_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_category_featured ON public.tours USING btree (category_id, is_featured) WHERE (is_featured = true);


--
-- Name: idx_tours_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_category_id ON public.tours USING btree (category_id);


--
-- Name: idx_tours_category_join; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_category_join ON public.tours USING btree (category_id, is_active, booking_count, rating);


--
-- Name: idx_tours_coordinates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_coordinates ON public.tours USING gist (coordinates) WHERE (coordinates IS NOT NULL);


--
-- Name: idx_tours_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_created_at ON public.tours USING btree (created_at DESC);


--
-- Name: idx_tours_destinations; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_destinations ON public.tours USING gin (destinations);


--
-- Name: idx_tours_discount; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_discount ON public.tours USING btree (discount_percentage DESC) WHERE (discount_percentage > (0)::numeric);


--
-- Name: idx_tours_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_display_order ON public.tours USING btree (display_order);


--
-- Name: idx_tours_eco_friendly; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_eco_friendly ON public.tours USING btree (eco_friendly) WHERE (eco_friendly = true);


--
-- Name: idx_tours_family_friendly; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_family_friendly ON public.tours USING btree (family_friendly) WHERE (family_friendly = true);


--
-- Name: idx_tours_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_featured ON public.tours USING btree (is_featured) WHERE (is_featured = true);


--
-- Name: idx_tours_fulltext_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_fulltext_search ON public.tours USING gin (to_tsvector('english'::regconfig, (((((name)::text || ' '::text) || (COALESCE(short_description, ''::character varying))::text) || ' '::text) || COALESCE(meta_description, ''::text)))) WHERE (is_active = true);


--
-- Name: idx_tours_group_size; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_group_size ON public.tours USING btree (max_group_size) WHERE (is_active = true);


--
-- Name: idx_tours_homepage_bestseller; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_homepage_bestseller ON public.tours USING btree (is_bestseller, booking_count DESC, rating DESC) WHERE ((is_active = true) AND (is_bestseller = true));


--
-- Name: idx_tours_homepage_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_homepage_featured ON public.tours USING btree (is_featured, display_order, rating DESC) WHERE ((is_active = true) AND (is_featured = true));


--
-- Name: idx_tours_homepage_new; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_homepage_new ON public.tours USING btree (is_new, created_at DESC, rating DESC) WHERE ((is_active = true) AND (is_new = true));


--
-- Name: idx_tours_homepage_trending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_homepage_trending ON public.tours USING btree (is_trending, view_count DESC, created_at DESC) WHERE ((is_active = true) AND (is_trending = true));


--
-- Name: idx_tours_is_new; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_is_new ON public.tours USING btree (is_new);


--
-- Name: idx_tours_new; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_new ON public.tours USING btree (is_new) WHERE (is_new = true);


--
-- Name: idx_tours_performance_metrics; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_performance_metrics ON public.tours USING btree (booking_count DESC, view_count DESC, wishlist_count DESC, rating DESC) WHERE (is_active = true);


--
-- Name: idx_tours_popular_by_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_popular_by_category ON public.tours USING btree (category_id, is_active, booking_count DESC, rating DESC, view_count DESC) WHERE (is_active = true);


--
-- Name: idx_tours_popularity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_popularity ON public.tours USING btree (booking_count DESC, view_count DESC);


--
-- Name: idx_tours_price_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_price_category ON public.tours USING btree (category_id, original_price, rating DESC) WHERE (is_active = true);


--
-- Name: idx_tours_price_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_price_range ON public.tours USING btree (original_price) WHERE (is_active = true);


--
-- Name: idx_tours_price_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_price_rating ON public.tours USING btree (original_price, rating DESC) WHERE (is_active = true);


--
-- Name: idx_tours_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_rating ON public.tours USING btree (rating DESC);


--
-- Name: idx_tours_recent_quality; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_recent_quality ON public.tours USING btree (created_at DESC, rating DESC, review_count DESC) WHERE (is_active = true);


--
-- Name: idx_tours_revenue; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_revenue ON public.tours USING btree (original_price, booking_count DESC) WHERE (is_active = true);


--
-- Name: idx_tours_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_search ON public.tours USING gin (to_tsvector('english'::regconfig, (COALESCE(name, ''::character varying))::text));


--
-- Name: idx_tours_temporal_trends; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_temporal_trends ON public.tours USING btree (created_at, booking_count DESC, view_count DESC) WHERE (is_active = true);


--
-- Name: idx_tours_themes; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_themes ON public.tours USING gin (themes);


--
-- Name: idx_tours_trending; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tours_trending ON public.tours USING btree (is_trending) WHERE (is_trending = true);


--
-- Name: idx_user_favorites_tour; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_favorites_tour ON public.user_favorites USING btree (tour_id);


--
-- Name: idx_user_favorites_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_favorites_user ON public.user_favorites USING btree (user_id);


--
-- Name: idx_user_preferences_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_preferences_key ON public.user_preferences USING btree (preference_key);


--
-- Name: idx_user_preferences_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_preferences_user ON public.user_preferences USING btree (user_id);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);


--
-- Name: idx_users_last_login; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_last_login ON public.users USING btree (last_login DESC);


--
-- Name: gallery_images gallery_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER gallery_updated_at_trigger BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.update_gallery_updated_at();


--
-- Name: blog_posts trigger_blog_post_metadata; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_blog_post_metadata BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_metadata();


--
-- Name: blog_posts trigger_blog_post_metadata_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_blog_post_metadata_insert BEFORE INSERT ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_metadata();


--
-- Name: destinations trigger_destination_metadata; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_destination_metadata BEFORE INSERT OR UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_destination_metadata();


--
-- Name: tours trigger_maintain_tour_pricing; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_maintain_tour_pricing BEFORE UPDATE OF original_price, discount_percentage ON public.tours FOR EACH ROW EXECUTE FUNCTION public.maintain_tour_pricing();


--
-- Name: tours trigger_update_category_statistics; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_category_statistics AFTER UPDATE OF category_id, is_active, booking_count, rating, review_count ON public.tours FOR EACH ROW EXECUTE FUNCTION public.update_category_statistics();


--
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contact_inquiries update_contact_inquiries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_contact_inquiries_updated_at BEFORE UPDATE ON public.contact_inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: destinations update_destinations_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: featured_reviews update_featured_reviews_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_featured_reviews_updated_at BEFORE UPDATE ON public.featured_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: homepage_settings update_homepage_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_homepage_settings_updated_at BEFORE UPDATE ON public.homepage_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notification_templates update_notification_templates_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: special_offers update_special_offers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_special_offers_updated_at BEFORE UPDATE ON public.special_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: system_settings update_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tour_categories update_tour_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tour_categories_updated_at BEFORE UPDATE ON public.tour_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tour_statistics update_tour_statistics_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tour_statistics_updated_at BEFORE UPDATE ON public.tour_statistics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tours update_tours_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON public.tours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_preferences update_user_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: analytics_events analytics_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: auditlogs auditlogs_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditlogs
    ADD CONSTRAINT auditlogs_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.users(id);


--
-- Name: blog_post_categories blog_post_categories_blog_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_post_categories blog_post_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_package_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_package_tier_id_fkey FOREIGN KEY (package_tier_id) REFERENCES public.packagetiers(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: contact_inquiries contact_inquiries_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_inquiries
    ADD CONSTRAINT contact_inquiries_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: destination_category_assignments destination_category_assignments_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_category_assignments
    ADD CONSTRAINT destination_category_assignments_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.destination_categories(id) ON DELETE CASCADE;


--
-- Name: destination_category_assignments destination_category_assignments_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_category_assignments
    ADD CONSTRAINT destination_category_assignments_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: destination_likes destination_likes_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_likes
    ADD CONSTRAINT destination_likes_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: destination_likes destination_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_likes
    ADD CONSTRAINT destination_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: destination_seasons destination_seasons_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destination_seasons
    ADD CONSTRAINT destination_seasons_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: destinations fk_destinations_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT fk_destinations_parent FOREIGN KEY (parent_destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: featured_reviews fk_featured_reviews_tour; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.featured_reviews
    ADD CONSTRAINT fk_featured_reviews_tour FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications fk_notifications_template; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_template FOREIGN KEY (template_id) REFERENCES public.notification_templates(id);


--
-- Name: tour_statistics fk_tour_statistics_tour; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_statistics
    ADD CONSTRAINT fk_tour_statistics_tour FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tours fk_tours_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT fk_tours_category FOREIGN KEY (category_id) REFERENCES public.tour_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inclusions inclusions_package_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inclusions
    ADD CONSTRAINT inclusions_package_tier_id_fkey FOREIGN KEY (package_tier_id) REFERENCES public.packagetiers(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: packagetiers packagetiers_included_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packagetiers
    ADD CONSTRAINT packagetiers_included_vehicle_id_fkey FOREIGN KEY (included_vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: packagetiers packagetiers_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packagetiers
    ADD CONSTRAINT packagetiers_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: review_helpfulness review_helpfulness_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: review_helpfulness review_helpfulness_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_helpfulness
    ADD CONSTRAINT review_helpfulness_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: tour_destinations tour_destinations_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_destinations
    ADD CONSTRAINT tour_destinations_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON DELETE CASCADE;


--
-- Name: tour_destinations tour_destinations_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_destinations
    ADD CONSTRAINT tour_destinations_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: tour_exclusions tour_exclusions_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_exclusions
    ADD CONSTRAINT tour_exclusions_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: tour_images tour_images_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_images
    ADD CONSTRAINT tour_images_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: tour_inclusions tour_inclusions_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tour_inclusions
    ADD CONSTRAINT tour_inclusions_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: touraddons touraddons_addon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.touraddons
    ADD CONSTRAINT touraddons_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES public.addons(id) ON DELETE CASCADE;


--
-- Name: touraddons touraddons_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.touraddons
    ADD CONSTRAINT touraddons_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: mv_homepage_statistics; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: postgres
--

REFRESH MATERIALIZED VIEW public.mv_homepage_statistics;


--
-- PostgreSQL database dump complete
--

