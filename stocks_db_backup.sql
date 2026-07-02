--
-- PostgreSQL database dump
--

\restrict F3ODaHkGQijHarkkP62LspcifAnYCangh4kCj9WlJ83EvJofyfjehBO0U4KsDg9

-- Dumped from database version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_settings (
    id integer NOT NULL,
    provider character varying(20) DEFAULT 'gemini'::character varying,
    gemini_key text,
    ollama_url text DEFAULT 'http://localhost:11434'::text,
    ollama_model text DEFAULT 'gpt-oss:20b-cloud'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    gemini_keys jsonb DEFAULT '[]'::jsonb,
    active_gemini_key text,
    ollama_models jsonb DEFAULT '["gpt-oss:20b-cloud"]'::jsonb,
    active_ollama_model text DEFAULT 'gpt-oss:20b-cloud'::text
);


ALTER TABLE public.ai_settings OWNER TO postgres;

--
-- Name: ai_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_settings_id_seq OWNER TO postgres;

--
-- Name: ai_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_settings_id_seq OWNED BY public.ai_settings.id;


--
-- Name: ai_usage_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_usage_stats (
    id integer NOT NULL,
    endpoint character varying(255) NOT NULL,
    success_count integer DEFAULT 0,
    last_used timestamp without time zone
);


ALTER TABLE public.ai_usage_stats OWNER TO postgres;

--
-- Name: ai_usage_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_usage_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_usage_stats_id_seq OWNER TO postgres;

--
-- Name: ai_usage_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_usage_stats_id_seq OWNED BY public.ai_usage_stats.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    user_id integer,
    symbol character varying(50) NOT NULL,
    target_price numeric(15,2) NOT NULL,
    condition character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'ACTIVE'::character varying
);


ALTER TABLE public.alerts OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alerts_id_seq OWNER TO postgres;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    id integer NOT NULL,
    maintenance_mode boolean DEFAULT false,
    alerts_interval_min integer DEFAULT 1,
    announcements_interval_min integer DEFAULT 5,
    corp_action_interval_min integer DEFAULT 10,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    summarize_all_announcements boolean DEFAULT false
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.app_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.app_settings_id_seq OWNER TO postgres;

--
-- Name: app_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.app_settings_id_seq OWNED BY public.app_settings.id;


--
-- Name: holdings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holdings (
    id integer NOT NULL,
    user_id integer,
    symbol character varying(50) NOT NULL,
    company_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    buy_price numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.holdings OWNER TO postgres;

--
-- Name: holdings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.holdings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.holdings_id_seq OWNER TO postgres;

--
-- Name: holdings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.holdings_id_seq OWNED BY public.holdings.id;


--
-- Name: otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otps (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    otp character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.otps OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.otps_id_seq OWNER TO postgres;

--
-- Name: otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otps_id_seq OWNED BY public.otps.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    user_id integer,
    symbol character varying(50) NOT NULL,
    quantity integer NOT NULL,
    buy_price numeric(15,2) NOT NULL,
    type character varying(10) NOT NULL,
    product character varying(20) DEFAULT 'MIS'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: processed_announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.processed_announcements (
    seq_id character varying(255) NOT NULL,
    symbol character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ai_summary text,
    ai_sentiment character varying(50),
    ai_impact character varying(50),
    attachment_url text,
    anndate text
);


ALTER TABLE public.processed_announcements OWNER TO postgres;

--
-- Name: processed_corporate_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.processed_corporate_actions (
    id integer NOT NULL,
    symbol character varying(50) NOT NULL,
    purpose text NOT NULL,
    record_date text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.processed_corporate_actions OWNER TO postgres;

--
-- Name: processed_corporate_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.processed_corporate_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.processed_corporate_actions_id_seq OWNER TO postgres;

--
-- Name: processed_corporate_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.processed_corporate_actions_id_seq OWNED BY public.processed_corporate_actions.id;


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.push_subscriptions (
    id integer NOT NULL,
    user_id integer,
    endpoint text NOT NULL,
    keys_p256dh text NOT NULL,
    keys_auth text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.push_subscriptions OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.push_subscriptions_id_seq OWNER TO postgres;

--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.push_subscriptions_id_seq OWNED BY public.push_subscriptions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

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
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id integer NOT NULL,
    user_id integer,
    symbol character varying(50) NOT NULL,
    company_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- Name: wishlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlists_id_seq OWNER TO postgres;

--
-- Name: wishlists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlists_id_seq OWNED BY public.wishlists.id;


--
-- Name: ai_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_settings ALTER COLUMN id SET DEFAULT nextval('public.ai_settings_id_seq'::regclass);


--
-- Name: ai_usage_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_stats ALTER COLUMN id SET DEFAULT nextval('public.ai_usage_stats_id_seq'::regclass);


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: app_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings ALTER COLUMN id SET DEFAULT nextval('public.app_settings_id_seq'::regclass);


--
-- Name: holdings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holdings ALTER COLUMN id SET DEFAULT nextval('public.holdings_id_seq'::regclass);


--
-- Name: otps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps ALTER COLUMN id SET DEFAULT nextval('public.otps_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: processed_corporate_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_corporate_actions ALTER COLUMN id SET DEFAULT nextval('public.processed_corporate_actions_id_seq'::regclass);


--
-- Name: push_subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.push_subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists ALTER COLUMN id SET DEFAULT nextval('public.wishlists_id_seq'::regclass);


--
-- Data for Name: ai_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_settings (id, provider, gemini_key, ollama_url, ollama_model, created_at, gemini_keys, active_gemini_key, ollama_models, active_ollama_model) FROM stdin;
1	ollama_round_robin		http://localhost:11434, http://localhost:11435	gpt-oss:20b-cloud	2026-06-30 12:45:48.67053	["AIzaSyCz010HkUBHslEzPq1B_ksPHx7kYVeEhKU"]	AIzaSyCz010HkUBHslEzPq1B_ksPHx7kYVeEhKU	["gpt-oss:20b-cloud", "nemotron-3-nano:30b-cloud"]	nemotron-3-nano:30b-cloud
\.


--
-- Data for Name: ai_usage_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_usage_stats (id, endpoint, success_count, last_used) FROM stdin;
1	http://localhost:11434, http://localhost:11435	10	2026-07-01 13:45:54.682859
12	http://localhost:11434	43	2026-07-01 15:53:36.612359
11	http://localhost:11435	43	2026-07-01 15:53:40.202608
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alerts (id, user_id, symbol, target_price, condition, created_at, status) FROM stdin;
27	2	BAJAJ-AUTO	10000.00	ABOVE	2026-06-26 11:34:46.519308	ACTIVE
28	2	BAJAJ-AUTO	9300.00	BELOW	2026-06-26 11:34:46.519308	ACTIVE
29	2	TVSMOTOR	2300.00	ABOVE	2026-06-26 11:34:46.519308	EXECUTED
41	1	KEC	530.00	ABOVE	2026-06-30 13:37:22.895521	ACTIVE
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, maintenance_mode, alerts_interval_min, announcements_interval_min, corp_action_interval_min, updated_at, summarize_all_announcements) FROM stdin;
1	f	1	1	10	2026-06-30 13:29:12.758192	t
\.


--
-- Data for Name: holdings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.holdings (id, user_id, symbol, company_name, quantity, buy_price, created_at) FROM stdin;
1	1	BAJAJ-AUTO	Bajaj Auto Limited	10	9550.50	2026-06-24 10:40:31.038905
2	1	TVSMOTOR	TVS Motor Company Limited	25	2150.20	2026-06-24 10:40:31.038905
3	1	HEROMOTOCO	Hero MotoCorp Limited	8	4620.00	2026-06-24 10:40:31.038905
4	1	IRFC	Indian Railway Finance Corporation Limited	1	93.55	2026-06-24 14:01:31.283095
5	2	BAJAJ-AUTO	Bajaj Auto Limited	10	9550.50	2026-06-26 11:34:46.519308
6	2	TVSMOTOR	TVS Motor Company Limited	25	2150.20	2026-06-26 11:34:46.519308
7	2	HEROMOTOCO	Hero MotoCorp Limited	8	4620.00	2026-06-26 11:34:46.519308
\.


--
-- Data for Name: otps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otps (id, email, otp, created_at) FROM stdin;
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, user_id, symbol, quantity, buy_price, type, product, created_at) FROM stdin;
1	1	BAJAJ-AUTO	5	9620.00	BUY	MIS	2026-06-24 10:40:31.038905
2	1	RELIANCE	15	2940.30	BUY	MIS	2026-06-24 10:40:31.038905
3	1	INFY	-10	1530.00	SELL	MIS	2026-06-24 10:40:31.038905
4	1	IRFC	1	93.55	BUY	CNC	2026-06-24 14:01:31.283095
5	2	BAJAJ-AUTO	5	9620.00	BUY	MIS	2026-06-26 11:34:46.519308
6	2	RELIANCE	15	2940.30	BUY	MIS	2026-06-26 11:34:46.519308
7	2	INFY	-10	1530.00	SELL	MIS	2026-06-26 11:34:46.519308
\.


--
-- Data for Name: processed_announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.processed_announcements (seq_id, symbol, created_at, ai_summary, ai_sentiment, ai_impact, attachment_url, anndate) FROM stdin;
106616592	TEXRAIL	2026-06-29 19:51:37.160764	\N	\N	\N	\N	\N
106616595	TEXRAIL	2026-06-29 19:59:27.47917	\N	\N	\N	\N	\N
test	test	2026-06-29 20:26:36.308778	sum	sent	imp	url	date
106682885	MTNL	2026-07-01 11:16:43.983633	MTNL announced that Shri Raghvendra Gupta has retired from the position of Chief General Manager effective 30 June 2026, and Ms. Kiran Dubey will assume the role in addition to her current duties without extra pay. The change is disclosed under SEBI LODR regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MTNL_01072026110742_SD_SE_01072026.pdf	\N
1234	BAJAJ-AUTO	2026-06-29 20:47:31.850818	Bajaj Auto Limited has announced the closure of its trading window for designated persons and their immediate relatives to prevent insider trading. This standard procedure, effective from July 1, 2026, will remain closed until 48 hours after the declaration of the unaudited standalone and consolidated financial results for the quarter ending June 30, 2026.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/lkwalimbe_bajajauto_co_in_29062026154640_SE_Intimation_-_Trading_Window_Closure.pdf	29-Jun-2026
106680530	CYIENT	2026-06-30 08:57:34.767886	Cyient Limited has announced the closure of its trading window for transacting in company securities. This closure, from July 1 to July 25, 2026, applies to Directors, Officials, and designated persons, in compliance with the insider trading code to prevent insider trading.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/CYIENT_30062026085248_TradingwindowSigned.pdf	\N
106681393	BAJAJ-AUTO	2026-06-30 15:45:35.248192	The company announced that it has published a newspaper advertisement regarding its proposed buyback of fully paid‑up equity shares, outlining the offer to eligible shareholders as of the record date, key timelines, and entitlement ratios. The advertisement fulfills the SEBI buyback disclosure requirements and informs shareholders of the upcoming buyback process.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/lkwalimbe_bajajauto_co_in_30062026154426_Newspaper_Dispatch_with_clippings_DSC.pdf	\N
106681595	BAJAJ-AUTO	2026-06-30 16:58:29.002064	Bajaj Auto received a favorable order from the Additional Commissioner (Appeals) that sets aside a demand for alleged tax suppression, removing a potential liability.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/lkwalimbe_bajajauto_co_in_30062026165641_SE_Intimation_Order_30_June_2026.pdf	\N
106682182	SBIN	2026-06-30 19:40:22.581533	SBI disclosed that three senior executives, including the Managing Director & CEO of SBI Funds Management, will superannuate effective 30 June 2026. The changes are filed under SEBI LODR Regulation 30.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SBIN_30062026193841_BSE_NSE_30062026.pdf	\N
106682887	GUJTHEM	2026-07-01 11:15:43.037557	The filing discloses that promoter Sachin D. Patel acquired 2,497,190 shares of Gujarat Themis Biosyn Limited from Themis Medicare Limited, increasing his stake to 2.29% of the company's share capital. The transaction is an inter‑se promoter transfer exempt from open‑offer obligations and was reported to the stock exchanges four working days prior to completion.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_01072026110753_disc.pdf	\N
106682896	HYUNDAI	2026-07-01 11:15:48.239594	Hyundai Motor India reported June 2026 sales of 51,335 units, with domestic sales of 39,635 and exports of 11,700, despite a temporary production loss of 13,900 units caused by a supplier fire. The company expects to recover the lost volume within Q2 of FY26‑27.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/HMILNSE_01072026111234_SALESNUMBER.pdf	\N
106682895	MASTERTR	2026-07-01 11:15:53.269465	\N	\N	\N	\N	\N
106682894	IDBI	2026-07-01 11:16:13.929037	IDBI Bank has notified that the amended Code of Practices and Procedures for Fair Disclosure of Unpublished Price Sensitive Information is now accessible on its website, complying with SEBI PIT Regulation 8(2). The filing is a routine compliance update with no immediate operational or financial implications.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MANESHJ_01072026111130_SE_CodeofFairDisclosure_01072026.pdf	\N
106682893	KSHITIJPOL	2026-07-01 11:16:17.372159	The company clarified that its April 2026 audited financial results have been reconciled and now fully comply with SEBI filing requirements, and it appointed an internal auditor for the upcoming financial year.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/KSHITIJPOL_30062026172757_clarification_1.pdf	\N
106682892	SHILCTECH	2026-07-01 11:16:29.78297	CareEdge has reaffirmed Shilchar Technologies' credit rating for its bank facilities at 'CARE A; Stable' and 'CARE A1', confirming a stable outlook. The rating reflects strong operational and financial performance for FY26.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/SHILCHARTECH_01072026111037_Credit_Rating_2026.pdf	\N
106682890	SUBEXLTD	2026-07-01 11:16:33.656038	Subex Ltd announced that its 32nd Annual General Meeting will be held via video conference on August 4, 2026, with a voting entitlement cut‑off date of July 28, 2026. The meeting will be conducted in compliance with SEBI and MCA regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SUBEXLTD_01072026110813_Letter_AGM_Date_Intimation.pdf	\N
106682889	ASMS	2026-07-01 11:16:36.573666	The company corrected a filing and released a revised press release detailing a partnership with Intellecap to digitally empower farmer producer organisations and enhance rural value chains through the AVIO SMART platform. The collaboration aims to improve digital adoption, financial inclusion, and market access for FPOs, FPCs, and producer enterprises across India, Asia, and Africa.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/BARTRONICS1_01072026110835_press_release_dated_1july_-_revised.pdf	\N
106682888	AWL	2026-07-01 11:16:40.537786	AWL Agri Business announced the addition of the Madhur sugar brand to its portfolio, expanding its food FMCG offerings. The inclusion aims to broaden consumer reach and leverage existing distribution networks.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/AWL_01072026110748_SE_Press_Release_Madhur_July_1_2026.pdf	\N
106682884	RMCL	2026-07-01 11:16:47.794884	The company replied to BSE and NSE queries on past compliance lapses, insolvency resolution, and penalty waivers, confirming that penalties for periods before and during CIRP have been waived and that it cannot file prior to August 2022, and clarified that consolidated financial results are not required due to capital thresholds.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/RMCL_23062026125435_Letterforwithdrawalofpenalty.pdf	\N
106682882	ASIL	2026-07-01 11:16:53.731946	Girnar Spintex Industries announced the board's approval of unaudited standalone financial results for the quarter ended June 30, 2025 and appointed Shrenik Nagaonkar & Associates as secretarial auditor for a five‑year term. The filing also includes related disclosures under SEBI LODR and a limited review report from the statutory auditors.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ASIL_30062026170837_GIRNARFR30062025FINAL1.pdf	\N
106682922	CARERATING	2026-07-01 11:34:18.43301	CARE Ratings disclosed that Sanjay Agarwal will assume the role of Chief Risk Officer effective August 1, 2026. The announcement includes his background as a chartered accountant with over 30 years of risk management experience.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/CARERATINGS_01072026113232_CARE.pdf	\N
106682881	ROUTE	2026-07-01 11:16:58.883795	Route Mobile announced a strategic partnership with Truecaller to expand its business messaging platform, enabling access to Truecaller's 500 million users and offering rich media capabilities. The collaboration aims to enhance customer engagement and drive long‑term value for enterprises.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ROUTE_01072026110257_UPLOADPRSigned.pdf	\N
106682879	COALINDIA	2026-07-01 11:17:01.444196	Coal India disclosed provisional June 2026 production and off-take figures, showing mixed growth across subsidiaries with some notable increases in coal production and off-take but also significant declines in certain units.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/COALINDIA_01072026105950_Production_June_2026.pdf	\N
106682877	UJJIVANSFB	2026-07-01 11:17:04.870161	The company announced that a public notice advertising its 10th Annual General Meeting was published in Financial Express and Hosadigantha. The AGM is scheduled for July 24, 2026 at 3:30 PM IST via video conference.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/UJJIVANBANK_01072026105930_42_Intimation_Newspaper_Publication_Post_AGM.pdf	\N
106682875	DJML	2026-07-01 11:17:07.976241	DJML announced the conversion of 261,503 warrants into equity shares, increasing its paid‑up share capital to ₹34.93 crore. The conversion was partially completed, leaving 3.61 million promoter warrants and 2.18 million public warrants still pending.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/DJML_01072026105843_BM_OUTCOME01072612.pdf	\N
106682864	VIKRAN	2026-07-01 11:17:11.822875	VIKRAN Engineering Limited updated the venue and details of its upcoming investor/analyst meeting scheduled for July 2, 2026, in Rajkot, Gujarat. The meeting will discuss generally available information and is not expected to contain UPSI.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/VIKRAN123_01072026105516_Intimation_of_Investor_meet.pdf	\N
106682865	ONGC	2026-07-01 11:17:14.834436	ONGC disclosed that three Executive Directors will superannuate effective 1 July 2026, as per SEBI LODR Regulation 30. The change is part of routine retirement and does not involve new appointments.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ONGC_01072026105520_seniormgt01072026.pdf	\N
106682863	JAYBARMARU	2026-07-01 11:17:19.662946	The company sent a reminder to shareholders about unclaimed dividends for FY 2018‑19 that are scheduled to be transferred to the IEPF, urging claim before September 30, 2026, and detailing the required documentation and process. It also highlighted the need to update KYC and dematerialize shares to avoid transfer to the IEPF.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/JAYBARMARUT_01072026105447_Intimation_specimen_letter_signed.pdf	\N
106682862	GAIL	2026-07-01 11:17:22.883609	Shri R K Jain ceased to be Director (Finance) and CFO effective 01.07.2026, and Shri Satish Kumar Sinha was appointed as Additional Director and CFO effective the same date. His extensive finance background and prior role as Executive Director (Finance & Accounts) bring deep sector expertise to the board.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/Himanshugail_01072026105245_1.pdf	\N
106682903	MANKIND	2026-07-01 11:22:26.662071	Mankind Pharma announced that its 35th Annual General Meeting will be held on August 4, 2026 at 3:30 PM IST via video conference, as per a newspaper advertisement. The notice was published in Financial Express and Jansatta on July 1, 2026.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MANKIND1_01072026111946_Covering.pdf	\N
106682902	ALLCARGO	2026-07-01 11:22:32.912818	The company clarified that the earlier XBRL filing for consolidated PAT and EPS contained errors, which have now been corrected and re‑uploaded, and that the quarterly financials were audited rather than limited‑review. It also confirmed that the board meeting outcomes and related disclosures have been properly communicated to the exchange.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/ALLCARGO_22062026151121_Clarification_letter_to_NSE_22062026_DSCSRS.pdf	\N
106682901	BHARATCOAL	2026-07-01 11:22:37.378871	The company disclosed senior management changes effective 30 June 2026, appointing Jayanta Kumar Das as Area General Manager (Mining) and Rakesh Kumar Sinha as Head of Excavation Department following superannuations. Avrendra Kumar also retired from the senior management team.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/BCCL_01072026111838_Announcement_SMP_Signed.pdf	\N
106682900	EBGNG	2026-07-01 11:22:40.742893	GNG Electronics announced a strategic distribution partnership with Redington Limited to expand nationwide distribution of its refurbished ICT solutions. The collaboration aims to leverage Redington's extensive channel network to accelerate growth in the organized refurbished ICT market.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/GNGNSE_01072026111221_Intimation_Press_Release_Distribution_Partnership_with_Redington.pdf	\N
106682914	AMIRCHAND	2026-07-01 11:27:43.381142	The company addressed NSE queries on its May 18 board‑meeting financial results, confirming it operates in a single segment and attaching a legible, machine‑readable PDF of the results along with the auditor’s report. The filing also includes the auditor’s opinion affirming compliance with SEBI listing regulations and Indian accounting standards.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ACJKEL12_16062026172045_Reply_to_NSE_Query_Final.pdf	\N
106682912	PNB	2026-07-01 11:27:50.094111	The bank announced that Executive Director Bibhu Prasad Mahapatra will vacate his office effective 1 July 2026 due to superannuation, as per a regulatory filing. The filing complies with SEBI LODR regulations and has been submitted for record.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/pnb2_01072026112425_Intimation_Change_in_Director_01072026_DS.pdf	\N
106682911	HOMEFIRST	2026-07-01 11:27:53.838632	The company disclosed that it conducted a one‑on‑one meeting with institutional investors on June 30, 2026. It also uploaded the investor presentation to its website and informed the exchanges.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/HOMEFIRST_01072026112416_Outcome_of_investor_meet_-_01072026.pdf	\N
106682910	BAJAJCON	2026-07-01 11:27:56.649791	\N	\N	\N	\N	\N
106682907	AAVAS	2026-07-01 11:27:56.993419	ICRA has placed Aavas Financiers' long-term ratings on watch with developing implications following the resignation of its CFO and CRO and the appointment of interim replacements. The rating action signals potential credit concerns amid leadership turnover.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/AAVAS_01072026112017_Intimation_CreditRating_.pdf	\N
106682906	HYUNDAI	2026-07-01 11:28:02.315928	Hyundai Motor India reported June 2026 sales of 51,335 units, comprising 39,635 domestic and 11,700 export units, despite a 13,900-unit production loss caused by a supplier fire that was resolved by June 22. The company expects to recover the lost volume within Q2 of FY26‑27.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/HMILNSE_01072026112129_Reg30Disc.pdf	\N
106671401	BOSCH-HCIL	2026-07-01 11:30:18.80203	\N	\N	\N	\N	\N
106671416	DEN	2026-07-01 11:34:18.012424	\N	\N	\N	\N	\N
106682919	BHEL	2026-07-01 11:34:22.698592	BHEL announced the record date of 17 July 2026 for a final dividend of Rs 1.40 per share and set 5 August 2026 as the date of its 62nd AGM, with e‑voting and electronic notice. The dividend will be paid by 3 September 2026 if approved by shareholders.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/BHEL_01072026113144_BM-outcome_to_SE_for_AGM__record_dates_fixation__003_.pdf	\N
106682918	SGFIN	2026-07-01 11:34:26.143221	SG Finserve reported a provisional loan book of INR 4,551 crore as of June 30, 2026, reflecting 82% year‑on‑year and 16% quarter‑on‑quarter growth. The figures are provisional pending audit approval.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/SGFINSERVE_01072026112700_Announcement_Loan_Book.pdf	\N
106671412	DPABHUSHAN	2026-07-01 11:34:31.079824	The company filed a SEBI compliance declaration confirming that the promoter HUF and its related parties have not encumbered any equity shares during FY 2025‑26. The filing lists numerous promoter entities and confirms no new share encumbrances.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/team_bbodade_23062026185644_DPABHUSHAN.pdf	\N
106682916	BHEL	2026-07-01 11:34:35.813555	BHEL announced the date of its 62nd Annual General Meeting and set 17 July 2026 as the record date for a final dividend of Rs 1.40 per share for FY 2025-26, with e‑voting and electronic notice procedures.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/BHEL_01072026112752_BM-outcome_to_SE_for_AGM__record_dates_fixation__003_.pdf	\N
106671406	BOSCH-HCIL	2026-07-01 11:34:39.272226	\N	\N	\N	\N	\N
106672188	WAAREERTL	2026-07-01 11:39:39.966181	Waaree Energies Ltd. declared that it has not placed any encumbrances on its shares of Waaree Renewable Technologies Limited during the financial year ending March 31, 2026, as required under SEBI regulations.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026122217_45.pdf	\N
106682929	KSR	2026-07-01 11:39:43.729302	KSR Footwear announced the resignation of CFO Suvajit Choudhury, effective June 30, 2026, as part of a strategic transfer to the Commercial Department, and the appointment of Vikram Jeet Sharma as Deputy General Manager - Strategic Planning & Commercial effective July 1, 2026. Both changes are disclosed under SEBI Listing Regulations with required annexures.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/KSR_01072026113830_Intimation.pdf	\N
106672184	DPABHUSHAN	2026-07-01 11:39:47.931805	The filing confirms that promoters and related parties have not encumbered any equity shares of DPABHUSHAN during the financial year 2025-26, complying with SEBI's disclosure norms. This transparency is expected to reassure investors about shareholding integrity.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026122039_46.pdf	\N
106682928	JINDALSTEL	2026-07-01 11:39:53.284253	The company announced that CARE Ratings upgraded its long-term and short-term bank facilities, as well as its proposed NCD issue, to higher ratings, and also upgraded its subsidiary Jindal Steel Odisha Limited's ratings. These upgrades reflect improved creditworthiness and are expected to enhance investor confidence.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/JINDALSTEL_01072026113759_stx-010726_signed.pdf	\N
106672171	DEVYANI	2026-07-01 11:39:58.269424	\N	\N	\N	\N	\N
106682927	LTM	2026-07-01 11:39:58.698476	LTM Limited reaffirmed its CRISIL AAA/Stable/Crisil A1+ rating and increased its bank loan limit to Rs 2,025.5 crore. The company also announced an offer to acquire Randstad’s Technology and Consulting Services business in Europe and Australia, targeting up to €160 million EV and adding over $500 million in annual revenue.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/LTI_01072026113636_Stockexchangeintimationsigned.pdf	\N
106672166	BRITANNIA	2026-07-01 11:40:04.605318	\N	\N	\N	\N	\N
106672161	RUPA	2026-07-01 11:40:05.025211	Rupa & Company disclosed that its promoter and promoter group collectively hold 5,827,5545 equity shares as of March 31, 2026, with no encumbrances, in line with SEBI's Regulation 31(4). The filing also listed individual promoter entities and their holdings.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026121549_49.pdf	\N
106682924	AHCL	2026-07-01 11:40:09.452504	The board of Anlon Healthcare approved the incorporation of two new subsidiaries—Anlon Medicare Private Limited for surgical implants and Anlon Biologics Private Limited for biosimilars—along with a name change for an existing subsidiary. These moves aim to expand the company’s product portfolio into high‑growth medical device and biologics segments.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ANLON2013_01072026113408_AHLOutcomeofBM01072026Signed.pdf	\N
106672191	ACMESOLAR	2026-07-01 11:45:15.139877	\N	\N	\N	\N	\N
106682935	CAMS	2026-07-01 11:45:15.584061	The company issued an addendum to its annual report clarifying the e‑voting schedule and correcting a typo in the cut‑off date. All other report contents remain unchanged and the e‑voting period runs from July 2 to July 6, 2026.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/Jaiganesh_01072026114333_AGM_Covering_letter_Addendum_to_Annual_Report.pdf	\N
106682933	MGEL	2026-07-01 11:45:19.128585	Mangalam Global Enterprise Limited announced that its 16th Annual General Meeting will be held on July 27, 2026 via video conference, with the notice published in Financial Express (English and Gujarati) and uploaded to its website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MGEL_01072026113945_Newspaper_Advertisement_-_16th_AGM_-_VC_OAVM_Signed.pdf	\N
106672195	INFOMEDIA	2026-07-01 11:45:25.933904	\N	\N	\N	\N	\N
106672193	JBCHEPHARM	2026-07-01 11:46:28.47532	\N	\N	\N	\N	\N
106682936	STLTECH	2026-07-01 11:46:28.916521	Sterlite Technologies announced the allotment of 2.57 million equity shares through a qualified institutional placement, raising ₹1,500 crore at ₹583.01 per share, increasing its paid‑up capital and providing details of allottees exceeding 5% holdings.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/STLTECH_01072026114514_SE_Intimation-Allotment_of_securities-_July_01_2026_FINAL_signed.pdf	\N
106682977	CENTURYPLY	2026-07-01 11:51:32.233111	ICRA has reaffirmed AA (Stable) long‑term and A1+ short‑term credit ratings for Century Plyboards (India) Ltd and its subsidiary Century Panels Ltd, confirming the company's strong credit profile. The reaffirmation, which includes ratings for various bank facilities, is expected to support investor confidence.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/CENTURYPLY_01072026115051_Credit_Rating_June_2026.pdf	\N
106672277	CHOLAFIN	2026-07-01 11:51:37.098432	\N	\N	\N	\N	\N
106682976	POWERGRID	2026-07-01 11:51:37.779664	The company disclosed that CFO Shri Ravisankar Ganesan will retire upon reaching superannuation on 30 June 2026. This retirement is presented as a routine change with no additional details on succession provided.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/POWERGRID1_01072026114913_BSENSEReg30Dt01072026.pdf	\N
106682975	KARURVYSYA	2026-07-01 11:51:45.263426	\N	\N	\N	\N	\N
106672232	TIINDIA	2026-07-01 11:51:45.958788	\N	\N	\N	\N	\N
106682974	KAJARIACER	2026-07-01 11:51:46.412361	The company announced a tender offer to repurchase up to 2.15 million shares (1.35% of paid‑up capital) at Rs 1,380 per share, with a total consideration capped at Rs 296.70 crore, to be executed between July 3 and July 9, 2026. The buyback will be carried out via the stock exchange mechanism and is subject to regulatory approvals.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/KAJARIACER_01072026113649_Letter_of__Offer.pdf	\N
106672221	DEN	2026-07-01 11:51:58.998953	\N	\N	\N	\N	\N
106672219	NETWORK18	2026-07-01 11:51:59.49835	\N	\N	\N	\N	\N
106672216	DPABHUSHAN	2026-07-01 11:51:59.88857	Promoter Renu Kataria declares that she and related parties have not encumbered any equity shares of DPABHUSHAN during FY 2025-26, confirming compliance with SEBI takeover regulations. The statement provides transparency and reassures investors of promoter shareholding integrity.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026124105_35.pdf	\N
106682937	KSR	2026-07-01 11:52:04.685293	KSR Footwear disclosed the resignation of CFO Suvajit Choudhury effective June 30, 2026, and the appointment of Vikram Jeet Sharma as Deputy General Manager - Strategic Planning & Commercial effective July 1, 2026. The filing meets SEBI Listing Regulations disclosure requirements.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/KSR_01072026114517_Intimation.pdf	\N
106682984	RCF	2026-07-01 11:57:07.99738	The company announced a senior management change, promoting Sanjeev Harilikar to Executive Director effective July 1, 2026, while Ms. Sunetra Kamble will superannate on the same date. The details were disclosed in a regulatory filing to BSE and NSE.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/RCF_01072026115537_ChangeinSM01072026.pdf	\N
106672310	GTPL	2026-07-01 11:57:13.214283	\N	\N	\N	\N	\N
106682980	ZEEL	2026-07-01 11:57:13.617153	\N	\N	\N	\N	\N
106682983	ATULAUTO	2026-07-01 11:57:13.627996	ATUL AUTO reported June 2026 sales of 3,641 units, a 34.6% YoY increase, driven by strong growth in three‑wheelers and EV sales. The company also posted FY‑to‑date sales up 42.5% YoY, indicating robust demand.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ATULAUTO_01072026115032_Letter_SalesPerformance_BSE_NSE_June2026.pdf	\N
106682982	PDSL	2026-07-01 11:57:18.118638	PDSL announced through a newspaper advertisement the details of its 15th Annual General Meeting, which will be conducted via video conference, including the record date and final dividend information. The notice also outlines shareholder participation and voting procedures via online platforms.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/PDSL_01072026115430_Ltr_NewspaperadPredispatch_01072026.pdf	\N
106672308	PKTEA	2026-07-01 11:57:25.002657	\N	\N	\N	\N	\N
106682979	RAILTEL	2026-07-01 11:57:25.479496	RailTel disclosed senior management changes due to the superannuation of Ms. Madhulika Pathak and Shri Jagdeep Singh, effective June 30, 2026, and the appointment of Shri Harish Pawaria as Executive Director/Northern Region. The filing, mandated by SEBI, will be posted on the company website and shared with subsidiaries.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/RAILTEL_01072026115400_Intimation_Change_SMP.pdf	\N
106672305	CGPOWER	2026-07-01 11:57:28.838334	Tube Investments of India Limited, via its promoter group, confirms that no additional encumbrances have been created over its shares in CG Power and Industrial Solutions Limited beyond those already disclosed for FY 2025-26. The filing is made to the stock exchanges and the target company's audit committee under SEBI takeover regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026130657_29.pdf	\N
106682978	TCI	2026-07-01 11:57:31.970627	The company announced that its 31st Annual General Meeting will be held on July 30, 2026 via video conference, and public notices were published in newspapers. The notice complies with SEBI listing regulations and the details are available on the company's website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ak_bansal_tcil_com_01072026115332_TC-_Newspaper_publication__Pre_adv_.pdf	\N
106672284	HATHWAY	2026-07-01 11:57:35.449917	\N	\N	\N	\N	\N
106682991	SGIL	2026-07-01 12:02:35.931415	\N	\N	\N	\N	\N
106682990	TICL	2026-07-01 12:02:35.952028	\N	\N	\N	\N	\N
106682989	WEWIN	2026-07-01 12:02:35.959095	\N	\N	\N	\N	\N
106682988	POWERGRID	2026-07-01 12:02:35.966652	\N	\N	\N	\N	\N
106682987	SIRCA	2026-07-01 12:02:35.976337	\N	\N	\N	\N	\N
106682986	PGHH	2026-07-01 12:02:35.989374	\N	\N	\N	\N	\N
106682995	WEWIN	2026-07-01 12:07:36.149454	We Win Limited's compliance officer issued a certificate confirming that the company maintains a compliant Structured Digital Database for insider trading disclosures for the quarter ended 30 June 2026, with no observed non‑compliance. The certificate covers adherence to SEBI's PIT Regulations and confirms proper capture and audit of UPSI events.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SUREVIN_01072026120525_Compliance_Certificate_30-06-2026.pdf	\N
106683001	CUMMINSIND	2026-07-01 12:12:41.428095	Cummins India announced the record date and payment schedule for its final dividend of ₹4.25 per share for FY 2025-26, to be paid after the AGM on August 14, 2026, and disclosed related tax and KYC compliance requirements. The notice also detailed electronic voting, shareholder communications, and KYC update procedures for dividend eligibility.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/CUMMINSIND_01072026121130_NewspaperadTDSRecordDateFinal.pdf	\N
106682996	HEROMOTOCO	2026-07-01 12:13:10.501421	Hero MotoCorp announced a final dividend of Rs 75 per share (3,750% payout) for FY2025‑26, to be paid after the AGM on August 5, 2026, with tax withholding and KYC update requirements. The notice also highlighted the discontinuation of payable‑at‑par warrants and promoted the 'Saksham Niveshali' shareholder campaign.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/HEROMOTO_01072026120525_STX_NewspaperPublication_01072026_SD.pdf	\N
106683007	HMT	2026-07-01 12:18:17.121801	HMT Limited disclosed a fine of Rs 171,100 each from BSE and NSE for missing the May 30 deadline to submit audited financial results for Q4 FY2026, though it is applying for a waiver and expects to file the results shortly.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/HMT_01072026121430_Reg.pdf	\N
106683005	MARUTI	2026-07-01 12:18:20.913175	Maruti Suzuki reported June 2026 sales of 200,390 units, with domestic passenger vehicle sales rising to 147,187 units and exports reaching 42,768 units. The figures represent growth over the same period last year and indicate strong demand across its passenger and utility vehicle segments.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/MARUTIASHISH_01072026121233_StxIntimation_Sales_June2026.pdf	\N
106683004	UNIONBANK	2026-07-01 12:18:24.689528	The bank announced that Executive Director Sanjay Rudra has completed his tenure effective June 30, 2026, and will cease to be a director on the board from July 1, 2026. The notice complies with SEBI listing regulations and informs shareholders of the board change.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/UNIONBANK_01072026121302_01072026_Cessation_of_Shri_Sanjay_Rudra.pdf	\N
106683002	GAYAHWS	2026-07-01 12:18:29.856406	The company disclosed that all outstanding loans from financial institutions, amounting to ₹50.15 crore as of 30 June 2026, are in default, with both principal and interest overdue beyond 30 days. This material credit event signals significant financial stress and raises concerns about the firm's ability to meet debt obligations.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/GAYAHWS_01072026121157_GHL__Bank_repayment_default_intimation_Quarterly_01072026.pdf	\N
106679907	AHLWEST	2026-07-01 12:23:33.76434	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026181920_AHLWEST.PDF	\N
106683034	BHARATCOAL	2026-07-01 12:23:34.38493	Bharat Coking Coal reported June 2026 provisional production figures showing declines across raw, coking, and washed coal outputs, as well as lower off‑take and overburden removal compared to prior periods. The downward trends suggest potential short‑term earnings pressure for the company.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/BCCL_01072026122211_Production_Performance_June_2026.pdf	\N
106683032	AEGISVOPAK	2026-07-01 12:23:38.570588	The company disclosed that senior management personnel Sukumar Nandi will assume the additional role of Head of National Operations Division effective July 1, 2026, while continuing as a Senior Management Personnel. This leadership expansion is reported under SEBI Listing Regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/AVTL_01072026122104_AVTL_Addition_of_role_SMP_01072026_Signed.pdf	\N
106683027	GILLETTE	2026-07-01 12:23:40.962896	Gillette India announced the appointment of Gopalakrishnan Kalianna as Sales Head effective August 1, 2026, while Rohini Venkateswaran will resign as Whole‑Time Director and be elevated to Senior Vice President‑Korea. The transition reflects a reshuffling of senior leadership within the company.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/GILLETTE_01072026122017_GILSEIntimationLetterChangeinSMP01072026.pdf	\N
106683022	BAJAJHFL	2026-07-01 12:23:44.406598	Bajaj Housing Finance announced the allotment of 250,000 secured redeemable non‑convertible debentures worth ₹2,500.8458 crore on a private placement basis, with a 7.64% coupon and maturity on 1 July 2030, to be listed on the BSE's wholesale debt segment. The issuance was approved by the Debenture Allotment Committee at a meeting held on 1 July 2026.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/BHFL_01072026121809_SE_intimation_allotment_under_S33T16.pdf	\N
106683021	MRPL	2026-07-01 12:23:48.322126	MRPL informed of the cessation of Director Pankaj Kumar, an ONGC nominee, effective 1 July 2026, as part of board changes. The change is in compliance with SEBI regulations and was communicated to the stock exchanges.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MRPL_01072026121805_IntimationSD.pdf	\N
106683010	GILLETTE	2026-07-01 12:23:52.5561	Gillette India announced the appointment of Gopalakrishnan Kalianna as Sales Head effective August 1, 2026, and the elevation of Rohini Venkateswaran to Senior Vice President-Korea, while she resigns as Whole-Time Director. The transition reflects leadership changes within the company.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/GILLETTE_01072026121657_GILSEIntimationLetterChangeinSMP01072026.pdf	\N
106683037	EASTSILK	2026-07-01 12:28:56.142329	The company disclosed that CRISIL has withdrawn its credit ratings on all bank loan facilities because Eastern Silk has no external borrowings, and attached the withdrawal rationale and letter.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/EASTSILK_01072026122342_Intimation_signed.pdf	\N
106683036	DIGITIDE	2026-07-01 12:29:04.449861	Digitide Solutions disclosed receipt of a tax refund of Rs 19.76 crore from the Income Tax Department for assessment year 2025-26, comprising Rs 18.38 crore tax refund and Rs 1.38 crore interest, received on June 30, 2026. The company stated that this refund will have no material impact on its financial or operational activities.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/DIGITIDE_01072026122412_Digitide_SEIntimation_Income_tax_refund.pdf	\N
106673154	AHLWEST	2026-07-01 12:29:10.417719	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026182940_AHLWEST.pdf	\N
106683035	AMANTA	2026-07-01 12:29:11.017683	AMANTA Healthcare Limited disclosed off‑market transfers of equity shares by its promoter and promoter group members under SEBI insider trading regulations. The filing is procedural and does not convey material news affecting the company's fundamentals.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/AMANTA_01072026122321_Intimation_under_SEBI_PIT_Regulation.pdf	\N
106683050	FINPIPE	2026-07-01 12:34:15.141144	Finolex Industries clarified that a clerical error in the XBRL filing mistakenly placed EPS figures under the wrong field, but the EPS numbers in the approved PDF financial statements are correct and unaffected. The company assured regulators that the error will be avoided in future filings.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/FINPIPE2_30062026094253_Clarification_NSE_signed.pdf	\N
106683049	HPL	2026-07-01 12:34:20.560488	HPL Electric & Power is notifying shareholders of unclaimed dividends from FY 2018‑19 that will be transferred to the Investor Education and Protection Fund if not claimed by October 15, 2026, and outlines the steps to claim them. The notice also warns that unclaimed shares will be transferred to IEPF, with no further liability to the company.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/HPL_01072026123229_SignedIntimation.pdf	\N
106683048	ZOTA	2026-07-01 12:34:27.949928	Zota Health Care announced that its Davaindia store network grew by 264 locations in Q1 FY27, reaching a total of 2,825 stores by June 30, 2026. The update reflects robust expansion driven by both company-owned (COCO) and franchise (FOFO) formats.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ZOTA_01072026123015_StoreUpdate01072026.pdf	\N
106683047	AHCL	2026-07-01 12:34:33.441761	The company disclosed that its Chairman and Managing Director, Punitkumar Rasadia, participated in an interview with Money TV on June 30, 2026, covering business performance, industry outlook, operational updates, growth strategy, capital expenditure, financial guidance, and M&A activities, without revealing any unpublished price-sensitive information. The interview is accessible via Money TV's website and YouTube, and the company asked the exchanges to record the information.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ANLON2013_01072026123009_AHLIntimationMoneyTVInterview01072026Signed.pdf	\N
106683046	FUSION	2026-07-01 12:34:36.941438	Fusion Finance Limited announced that newspaper advertisements for the 32nd Annual General Meeting and e‑voting details were published in Financial Express and Jansatta on July 1, 2026, with the meeting scheduled for July 22, 2026 via video conference. The notice complies with SEBI listing regulations and the company’s website will host the relevant documents.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/FUSIONHO_01072026123003_NewspaperAdv_PostDispatch_SIGN.pdf	\N
106683071	KSR	2026-07-01 12:39:42.629488	Mr. Suvajit Choudhury resigned as Chief Financial Officer effective June 30, 2026, and Mr. Vikram Jeet Sharma was appointed as Deputy General Manager - Strategic Planning & Commercial effective July 1, 2026. Both changes are disclosed under SEBI Listing Regulations with the required annexures.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/KSR_ROID_90869_KMP_Doc.zip	\N
106672318	JINDALSTEL	2026-07-01 12:39:46.412919	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026131426_25.pdf	\N
106683065	ASHOKLEY	2026-07-01 12:39:46.927629	ASHOKLEY reported June 2026 sales of 19,194 vehicles, a 25% year‑on‑year increase, with M&HCV trucks up 44% and LCVs up 28%, indicating strong demand. Cumulative sales for the first six months rose 10% to 46,302 units.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ASHOKLEYLAND_01072026123655_19salesvolumeJune2026.pdf	\N
106683064	MFSL	2026-07-01 12:39:50.646975	MFSL’s subsidiary Axis Max Life exercised a call option to fully redeem INR 4,960 crore of debentures, with redemption scheduled for July 31, 2026. The move eliminates the debt obligation and reflects the subsidiary’s strong liquidity position.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/Max_01072026123635_SED01072026.pdf	\N
106683058	WHIRLPOOL	2026-07-01 12:39:54.596599	The Board approved the promotion of Jijesh Gopalan to Vice President‑Service and the transition of Anish Ahuja to a new strategic role, alongside the resignation of Bharat Gulati effective July 14, 2026. Successors for Gulati and Ahuja's former positions will be announced later.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/WHIRLPOOL_01072026123332_SEIntimation_signed.pdf	\N
106683057	VARROC	2026-07-01 12:40:00.454348	Varroc Engineering confirmed no fund-raising or deviation in fund utilization for Q1 FY2026-27, filing a nil deviation statement with stock exchanges.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/VARROC_01072026123400_Nil_deviation_report.pdf	\N
106683056	VARROC	2026-07-01 12:40:03.203266	Varroc Engineering submitted a regulatory filing to NSE and BSE outlining the appointment of Mr. Anil Ghatiya as Compliance Officer and MUFG Intime India Private Limited as Registrar & Share Transfer Agent, effective July 31, 2025, in compliance with SEBI listing regulations. The disclosure updates the company's corporate governance details without altering operational performance.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/VARROC_01072026123252_Details_ComplianceOfficer.pdf	\N
106683078	WINDLAS	2026-07-01 12:45:09.772221	Windlas Biotech announced its 25th AGM scheduled for July 23, 2026, and declared a dividend of Rs 6.30 per share (126% of face value) for FY 2025-26, subject to shareholder approval. The record date for dividend eligibility is set for July 16, 2026.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/WINDLAS_01072026124322_Record_Date_16072026.pdf	\N
106683077	MEESHO	2026-07-01 12:45:13.777576	Meesho Limited announced the grant of 3,886 stock options to eligible employees under its ESOP 2024 plan, convertible into 1,90,414 equity shares at Re. 1 per option, complying with SEBI Listing Regulations and to be posted on its investor website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MEESHO_01072026124331_ML_Intimation_Grant_of_ESOP_01072026.pdf	\N
106683074	CREATIVEYE	2026-07-01 12:45:17.030705	The company announced the release of annexure documents A, B, and C. These annexures are part of the latest regulatory filing.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/CREATIVEYE_30062026162156_FInancial_and_audit_report.pdf	\N
106683073	MEESHO	2026-07-01 12:45:20.513374	The company announced the allotment of 1,34,50,895 equity shares under its 2024 Employee Stock Option Plan, increasing the paid‑up share capital from Rs 460.86 crore to Rs 462.21 crore. These shares will be issued to eligible employees upon exercise of vested options and will rank pari‑passu with existing shares.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MEESHO_01072026123950_ML_Intimation_Allotment_of_ESOPs_01072026.pdf	\N
106672332	KAVDEFENCE	2026-07-01 12:45:23.720955	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026132034_22.pdf	\N
106683072	HEROMOTOCO	2026-07-01 12:45:24.155391	Hero MotoCorp reported a 23% year‑on‑year increase in Q1 FY27 dispatches, reaching 1.68 million units, driven by strong domestic retail and growth in its electric mobility segment. The company also launched new flex‑fuel motorcycles and was recognized for AI innovation, reinforcing its growth outlook.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/HEROMOTO_01072026124008_STX_PressRelease_01072026_SD.pdf	\N
106672321	SHANTIGEAR	2026-07-01 12:45:28.237363	Tube Investments of India confirmed via a regulatory filing that its promoters have not incurred any new encumbrances on their shares beyond previously disclosed ones. The statement satisfies SEBI's disclosure requirements for Shanthi Gears Limited.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026131537_24.pdf	\N
106683084	PIXTRANS	2026-07-01 12:50:32.296144	The company announced a notice of its 44th Annual General Meeting, detailing remote e‑voting, book closure, and cut‑off dates for shareholder communications. It also outlined voting procedures and the availability of AGM materials on the company's website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SHYBUV_01072026124741_Newspaper_notice.pdf	\N
106683083	INDOWIND	2026-07-01 12:50:36.847289	The company clarified that its financial results have been signed by a Whole-time Director in compliance with SEBI LODR regulations and corrected XBRL discrepancies before resubmission. This compliance addresses prior filing issues and reinforces governance standards.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/INDOWIND_30062026160610_ielnsereply300626.pdf	\N
106683082	VEEDOL	2026-07-01 12:50:40.30092	VEEDOL disclosed that it has placed advertisements in The Telegraph and Aajkaal announcing the transfer of its equity shares to the Investor Education and Protection Fund (IEPF) suspense/demat account, as required under SEBI regulations. The notice is also available on the company's website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/TIDEWATER1_01072026124620_IEPFnewspaper01072026.pdf	\N
106683081	MOIL	2026-07-01 12:50:44.248034	MOIL announced a 5% reduction in prices of various manganese ore grades effective July 2026, with some specific grades seeing a 10% cut. The company also maintained existing basic prices for EMD and EMD flakes.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/MOIL_01072026124606_Price_01072026.pdf	\N
106672324	AAREYDRUGS	2026-07-01 12:50:46.974724	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026131637_23.pdf	\N
106672336	EMMVEE	2026-07-01 12:50:47.584324	The filing confirms that the promoter and associated entities have not placed any additional encumbrances on their shares for the fiscal year ending March 31, 2026, and provides an updated list of promoter holdings. This compliance disclosure is routine and does not introduce new financial information.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026132149_21.pdf	\N
106672705	CHEMPLASTS	2026-07-01 12:55:50.522644	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026162737_CHEMPLASTS.pdf	\N
106672667	XLENERGY	2026-07-01 12:55:50.923094	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026162342_XLENERGY1.pdf	\N
106672626	PNGJL	2026-07-01 12:55:52.476262	The promoter group of P N Gadgil Jewellers Limited confirms that no encumbrances have been placed on its shares during the financial year ended March 31, 2026, in compliance with SEBI takeover regulations. This disclosure assures investors of the promoter's unencumbered shareholding.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026161337_PNGJL.pdf	\N
106683093	SGIL	2026-07-01 12:55:56.63074	Synergy Green Industries Limited announced the publication of newspaper advertisements for its 16th Annual General Meeting notice and e‑voting details, filed in compliance with SEBI regulations. The notice was released on July 1, 2026, and is available on the company's website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SGIL_01072026125348_Submission_of_Advt.pdf	\N
106672618	HEADSUP	2026-07-01 12:55:59.540893	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026161109_HEADSUP1.pdf	\N
106672344	AMIRCHAND	2026-07-01 12:55:59.898918	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026132546_18.pdf	\N
106672342	AARTIDRUGS	2026-07-01 12:56:00.336074	Promoters of Aarti Drugs have encumbered 641,814 and 597,957 shares respectively as of March 31, 2026, with no other encumbrances during the financial year, as disclosed under SEBI's Regulation 31(4). The filing provides an update on promoter share pledges and includes a comprehensive list of promoter group members.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/team_sandeshc_24062026132437_19.pdf	\N
106683088	ADOR	2026-07-01 12:56:04.267661	ADOR Welding Limited announced the filing of newspaper publications for its 73rd Annual General Meeting scheduled for 23 July 2026 via video conference, including e‑voting instructions and related disclosures. The notice also contains an unrelated asset recovery notice from Union Bank concerning a defaulted loan.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ADORWELD_01072026125024_reg30newspaperv1.pdf	\N
106683100	KSR	2026-07-01 13:01:31.873895	The company announced that its board has empowered certain key managerial personnel to assess materiality and disclose information to stock exchanges under SEBI LODR regulations. This is a routine compliance filing with no operational or financial details disclosed.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/KSR_01072026125637_Intimation30.pdf	\N
106672741	EMKAY	2026-07-01 13:01:35.145492	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026163810_EMKAY.pdf	\N
106683099	IREDA	2026-07-01 13:01:35.836627	The company announced the retirement of Chairman & Managing Director Pradip Kumar Das effective 01 July 2026, with Dr. Bijay Kumar Mohanty assuming additional charge as Chairman & Managing Director for three months. This leadership transition is part of routine succession planning and does not introduce significant operational changes.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/IREDAEQ_01072026125859_Signedchangeindirector01072026.pdf	\N
106683098	TICL	2026-07-01 13:01:39.424723	The filing discloses that promoter Ravi Todi sold shares, reducing his stake to 31.79% of voting rights. This reduction in promoter ownership may affect market perception of the company.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/TCLCONS_01072026125848_DisclosureRegardingSaleOfSharseRaviSir30062026.pdf	\N
106683095	GOLDIAM	2026-07-01 13:01:48.955084	Goldiam International announces an investor meeting scheduled for July 7, 2026 at 4:30 p.m. at Quantum AMC in Mumbai, to discuss its financial and operational performance. The discussion will be based on previously released investor materials, with no unpublished price‑sensitive information disclosed.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/GOLDIAM_01072026125821_Investor_Meet-7-7-26.pdf	\N
106683111	IKIO	2026-07-01 13:06:52.20157	IKIO Technologies has postponed its 10th Annual General Meeting to July 30, 2026, to be held via video conference. The meeting will comply with regulatory requirements and stakeholders are asked to take note.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/IKIO_01072026130600_Intimation_of_new_date_of_AGM.pdf	\N
106673141	CRAMC	2026-07-01 13:06:55.178246	ORIX Corporation Europe N.V., the promoter of Canara Robeco Asset Management Company Limited, filed a mandatory SEBI disclosure confirming that it and its concert parties have not encumbered any shares of the target company during FY 2025‑26, maintaining its ~37% stake. The filing satisfies regulatory requirements and provides no indication of new share purchases or disposals.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026182624_CRAMC.pdf	\N
106683110	LALPATHLAB	2026-07-01 13:07:00.407406	The company issued a notice convening its 32nd Annual General Meeting scheduled for July 25, 2026, to be held via video conference, and included resolutions on remuneration and the re‑appointment of the Executive Chairman.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/LALPATHLAB_01072026130411_IntimationtoSE_AGMNOTICE.pdf	\N
106672819	KRYSTAL	2026-07-01 13:07:05.859453	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026170640_KRYSTAL.pdf	\N
106683104	TCIEXP	2026-07-01 13:07:06.316644	TCI Trading (Dharmpal Agarwal) sold 1.239 million shares of TCI Express, while TCI Express Consolidated acquired the same number, leading to a slight reduction in the former's promoter stake to 6.15% and a modest increase in the latter's stake to 44.72%.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/TCIEXP_01072026130145_StockExchangeUplaoding-Takeover.pdf	\N
106683101	ORIENTCER	2026-07-01 13:07:11.377556	Orient Ceratech announced that a newspaper notice regarding a postal ballot and e‑voting dates was published. The same notice also includes an e‑auction sale of certain secured assets under the SARFAESI Act.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/ORIENTABRA_01072026130116_SENewspaperAdvtPostalBallot.pdf	\N
106672801	GREENPOWER	2026-07-01 13:07:22.541136	SVL Limited, a promoter of Orient Green Power, disclosed its aggregate pledged shareholdings as of March 31, 2026, showing a 100% encumbrance on Janati Bio Power's shares and a total promoter/PAC holding of 28,59,70,024 equity shares. The filing also notes the merger of former promoters into SVL and pending share credits.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026165831_GREENPOWER.pdf	\N
106683118	MANORG	2026-07-01 13:12:27.880396	The company disclosed the retirement of its CFO and the appointment of a new CFO, effective July 1, 2026, and updated the contact details of directors and key managerial personnel as required by SEBI. The filing was submitted to the stock exchanges to comply with Regulation 30(5) of the SEBI Listing Regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MANORG_01072026130859_INTIMATION_OF_REG_30.pdf	\N
106673199	BPCL	2026-07-01 13:12:32.079107	BPCL announced that the Indian government promoter has not encumbered any of its shares during the fiscal year ended March 2026, confirming compliance with SEBI takeover regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026184740_BPCL.pdf	\N
106673191	DMCC	2026-07-01 13:12:36.486064	The filing lists the names, entity types, and PANs of multiple promoters and promoter groups associated with DMCC, detailing their shareholding relationships. It does not disclose any new acquisition, disposal, or change in ownership stakes.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026184457_DMCC1.pdf	\N
106683117	PTC	2026-07-01 13:12:39.381568	PTC India issued a postal ballot notice to shareholders and secured approval for a ₹120 crore share repurchase. Additionally, the company approved a ₹1.25 lakh crore budget under ISM 2.0 and awarded new contracts worth ₹2,957 crore.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/PTC_01072026130906_PTC_Intimation_of_NP-01072026.pdf	\N
106673182	ROTO	2026-07-01 13:12:50.572402	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026183941_ROTO.pdf	\N
106673166	THELEELA	2026-07-01 13:12:51.037717	The promoters of The Leela Palaces Hotels & Resorts Ltd have confirmed that there are no undisclosed encumbrances on their shareholdings for the financial year 2025-26, and they will promptly disclose any future encumbrances. The filing is a routine compliance update with no material impact on the company's operations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_24062026183304_THELEELA.pdf	\N
106683126	MARICO	2026-07-01 13:17:55.723726	Marico disclosed that independent director Milind Barve will retire effective August 1, 2026 due to health concerns and will not seek re‑appointment. The company simultaneously appointed Girish Paranjpe and Apurva Purohit to lead its Audit, Risk Management, and Stakeholder Relationship Committees.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/marico_01072026131429_SE_Intimation.pdf	\N
106683125	EICHERMOT	2026-07-01 13:17:59.163634	Eicher Motors reported June 2026 sales data for its subsidiary VE Commercial Vehicles, showing a 29.3% YoY increase in total volume and strong growth across domestic and export segments. The robust performance signals continued demand for trucks, buses, and electric vehicles.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/Navneetnse_01072026131208_VECVJun26salesUpdate1stJuly26UpdatedSigned.pdf	\N
106683123	BSL	2026-07-01 13:18:03.383979	BSL Limited is reminding shareholders to update their PAN, KYC, nomination and bank details for physical share holdings, and informing them about a special window for re‑lodging transfer requests and new dematerialisation procedures. The notice also outlines required forms and deadlines for compliance.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/BSL_01072026131403_BSL_.pdf	\N
106683122	CAPILLARY	2026-07-01 13:18:07.403333	Capillary Technologies announced the grant of 745,537 stock options under its 2021 ESOP scheme, with an exercise price set at a discount to fair market value for most employees. The options vest over three to four years and can be exercised up to ten to twelve years after vesting, subject to conditions.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/CAPILLARY12_01072026131140_Intimation_ESOP_Grant.pdf	\N
106683121	MTNL	2026-07-01 13:18:12.500863	MTNL disclosed the appointment of its compliance officer and RTA for the quarter ended June 30, 2026, confirming Ratn Mani Sumit as compliance officer and Beetal Financial & Computer Services Pvt Ltd as RTA.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MTNL_01072026131318_SD_SE_CS_01072026.pdf	\N
106683120	SIGMAADV	2026-07-01 13:18:15.788438	The company released a revised corporate presentation outlining its aerospace and defense capabilities, product portfolio, and international footprint. No financial results or operational updates were disclosed.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MEGASOFT_01072026131234_DisclosureReg30CPRevised.pdf	\N
106683129	NACLIND	2026-07-01 13:23:22.868561	NACL Industries disclosed a notable increase in share trading volume and price across several dates in late June 2026, referencing prior surveillance communications. The company reaffirmed its compliance with SEBI disclosure obligations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/NACLIND_01072026132036_NSE_Letter.pdf	\N
106683128	ITC	2026-07-01 13:23:28.171814	ITC Limited announced the publication of the notice for its 115th Annual General Meeting scheduled for 23 July 2026, including details on remote e‑voting and availability of the AGM materials online. The notice complies with SEBI regulations and provides voting instructions to shareholders.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ITC_01072026132049_SELetter.pdf	\N
106679620	HATHWAY	2026-07-01 13:23:32.489264	Reliance Industrial Investments and Holdings Limited declared that it has not placed any encumbrance on the shares of Hathway Cable and Datacom Limited during the financial year 2025-26, as required under SEBI takeover regulations. The statement was filed with the stock exchanges to assure investors of the promoter's clean shareholding status.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026164840_HATHWAY.pdf	\N
106679605	GREENPOWER	2026-07-01 13:23:38.247817	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026164602_ORIENT.pdf	\N
106683127	LALPATHLAB	2026-07-01 13:23:38.874435	The company has submitted its Business Responsibility and Sustainability Report for FY 2025-26 to the exchange as required by SEBI regulations. The filing is a compliance disclosure with no material financial implications.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/LALPATHLAB_01072026131854_IntimationtoSE_BRSR.pdf	\N
106679578	KAVDEFENCE	2026-07-01 13:23:45.815474	Promoter C Mokshith Reddy disclosed a 3.74% stake of 2.25 million shares in Kavveri Defence & Wireless Technologies as of March 31, 2026, confirming no encumbrances on those shares. The company also announced an allotment of 2.25 million shares under convertible warrants, with listing approval pending.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026163946_KAVDEFENCE1.pdf	\N
106683130	KARURVYSYA	2026-07-01 13:25:00.506462	The company disclosed provisional unaudited financials showing double‑digit year‑on‑year growth in total business, advances, deposits and CASA as of June 2025 and June 2026. The filing complies with SEBI disclosure norms and is subject to limited auditor review.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/KARURVYSYA_01072026132047_IRC_Jun_2026_DSC.pdf	\N
106683134	SARLAPOLY	2026-07-01 13:30:04.819385	The company announced the pre‑dispatch newspaper advertisement for its 33rd Annual General Meeting scheduled for July 29, 2026, and set July 22, 2026 as the record date for the final dividend of FY 2025‑26. The notice complies with SEBI and regulatory requirements and is available on the company website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SARLAPOLY_01072026132829_SEIntimation_Signed.pdf	\N
106683133	POWERGRID	2026-07-01 13:30:13.394526	The notice informs that Dr. Yatindra Dwivedi, currently Director (Personnel), has been assigned additional charge as Director (Finance) effective 1 July 2026 for up to three months, pending a permanent appointment. This is disclosed under SEBI's listing regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/POWERGRID1_01072026132804_BSENSEReg30DT01072026SIGNED.pdf	\N
106683132	ZAGGLE	2026-07-01 13:30:17.205662	Zaggle announced a five‑year agreement with Hindustan Petroleum Corporation Limited to integrate its platform with HPCL's Driver Track Plus fleet program, offering loyalty reward points funded by HPCL. The deal's financial contribution will be tied to the number of users onboarded and fuel spend, making its exact value uncertain but potentially significant.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ZAGGLE_01072026132741_HPCL.pdf	\N
106683131	POWERGRID	2026-07-01 13:30:20.522033	The company announced the appointment of Shri Venkata Subrahamanayam Vallurie as its new Chief Financial Officer, effective 1 July 2026. He brings over 35 years of finance experience, including extensive service within Powergrid.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/POWERGRID1_01072026132551_BSENSEReg30dt01072026CFOAppttsigned.pdf	\N
106683136	SWSOLAR	2026-07-01 13:35:29.17041	\N	\N	\N	\N	\N
106683164	NINSYS	2026-07-01 13:40:34.379213	NINSYS disclosed a regulatory filing regarding the purchase of 1,857,600 equity shares by related parties, increasing their combined stake in the company. The filing details the acquirer's holdings and transaction dates but provides no immediate market guidance.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/NINSYS_01072026133846_DisclosureunderReg29_2_.pdf	\N
106683163	APLAPOLLO	2026-07-01 13:40:39.902218	APL Apollo reported a 6% year‑on‑year decline in Q1FY27 sales volume to 744,823 tonnes, reflecting weaker demand across its product lines. The company also introduced a new product segmentation framework to improve reporting clarity.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/APLAPOLLO_01072026133715_Covering.pdf	\N
106683141	NINSYS	2026-07-01 13:40:43.880747	The filing discloses that promoter Niraj Chhaganraj Gemawat purchased additional equity shares of NINSYS, raising his stake marginally. The transaction is reported under SEBI's insider trading disclosure norms and is recorded for regulatory compliance.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/NINSYS_01072026133554_DisclosureunderReg7_2_.pdf	\N
106683166	FIBERWEB	2026-07-01 13:45:48.562909	Fiberweb announced the appointment of Milind Ghelani as its new Chief Financial Officer and Key Managerial Personnel, effective 1 July 2026. The Board approved the appointment at its meeting on 14 May 2026, and the appointment is disclosed under SEBI Regulation 30.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/FIBERWEB_01072026134116_FIL_Intimation_under_Reg_30_Appointment_of_CFO.pdf	\N
106683165	DHANUKA	2026-07-01 13:45:51.970754	The company announced that Senior General Manager – Quality Abu Khalid retired effective June 30, 2026, as per superannuation policy, and no resignation letter is required. The change is disclosed under SEBI Listing Regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/DHANUKA_01072026134117_Coveringsmpsd.pdf	\N
106683171	CGPOWER	2026-07-01 13:50:54.815836	CG Power announced the publication of newspaper notices regarding its 89th Annual General Meeting scheduled for 24 July 2026, and provided details on voting procedures and remote e‑voting for shareholders. The notice complies with SEBI listing regulations and outlines electronic voting and documentation requirements for members.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/CGPOWER_01072026134932_SE_Disclosure_Newspaper_Ad_89th_AGM.pdf	\N
106683175	DCMSHRIRAM	2026-07-01 13:56:13.852813	The company disclosed a penalty of Rs 1.59 crore imposed by the Income Tax Department for FY 2021-22, related to the treatment of building sales as capital assets. It states the penalty has no material financial or operational impact and plans to challenge the order legally.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/DCMSHRIRAM_01072026135434_DCMPENALTYINCOMETAX1JULY2026SIGNED.pdf	\N
106683174	ISHANCH	2026-07-01 13:56:16.96061	The company has formally proposed to become the exclusive dealer for sulphur‑based industrial chemicals for A‑1 Limited, which could expand its revenue and market share. The proposal is non‑binding but signals potential future growth opportunities.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ISHANDYES_01072026135210_Ishan_Reg_30_Disclosure.pdf	\N
106683173	PERSISTENT	2026-07-01 13:56:19.608512	Persistent Systems has announced that the trading window for its shares will be closed from July 1, 2026 until 48 hours after the release of the quarterly results for the period ended June 30, 2026. The notice also indicates that a board meeting will be communicated in due course.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/PERSISTENTUSER1_01072026135111_PSLIntimationofclosureoftradingwindowSigned.pdf	\N
106683177	IIFL	2026-07-01 14:05:23.554585	\N	\N	\N	\N	\N
106683179	WINDLAS	2026-07-01 14:10:23.667666	Windlas Biotech announced the notice for its 25th Annual General Meeting scheduled for July 23, 2026, to be held via video conference, including agenda items such as adoption of audited financial statements, declaration of a final dividend, and appointments of directors. The notice also details e‑voting procedures, a shareholder cut‑off date, and special resolutions on auditor remuneration and an independent director appointment.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/WINDLAS_01072026140859_25TH_AGM_UP.pdf	\N
106683178	GODREJAGRO	2026-07-01 14:10:27.324394	Godrej Agrovet announced that its 35th Annual General Meeting will be held on August 5, 2026 via video conference. The notice was published in Business Standard (English) and Mumbai Lakshadeep (Marathi) and is also available on the company's website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/GODREJAGRO_01072026140604_BSENSENPPREAGMNOTICE01072026.pdf	\N
106683181	ASHIMASYN	2026-07-01 14:14:51.311033	\N	\N	\N	\N	\N
106683180	NAM-INDIA	2026-07-01 14:14:51.3448	\N	\N	\N	\N	\N
106683186	ASHIMASYN	2026-07-01 14:19:51.779705	ASHIMA announced the reconstitution of its Nomination and Remuneration Committee and Stakeholders' Relationship Committee effective July 1, 2026, following board approval under SEBI regulations. The revised committee composition includes new members and changes in chairmanship.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ASHIMASYN_01072026141758_Re-Constitution.pdf	\N
106683184	TMCV	2026-07-01 14:19:57.876498	Tata Motors reported Q1 FY27 sales of 108,488 units, up 27% YoY, with robust growth across commercial vehicle segments and a 4.4X YoY rise in EV volumes. Management highlighted continued double‑digit growth, strong demand fundamentals, and a positive outlook despite geopolitical uncertainties.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/TMLCOMMERCIAL_01072026141712_CVSALESRELEASE.pdf	\N
106683183	HIMATSEIDE	2026-07-01 14:20:03.89351	Himatsingka Seide Limited announced the allotment of 300 Series D non‑convertible debentures worth ₹15 crore at 11.5% interest, with a 42‑month tenure and security over its assets. The issuance is a private placement and does not involve a stock exchange listing.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/HIMATSEIDE_01072026141708_SE_Allotment_SeriesD.pdf	\N
106683182	HAL	2026-07-01 14:20:08.147011	The company announced the appointment of three senior managers effective July 1, 2026. These appointments are part of routine management changes and do not indicate a strategic shift.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/HAL_01072026141639_ChangeInSeniorMngt_01072026.pdf	\N
106683192	VOEPL	2026-07-01 14:25:11.824098	The company announced a scheduled virtual one‑to‑one meeting with IGE India Family Office on July 6, 2026, to discuss publicly available information, with no unpublished price‑sensitive material to be shared. The meeting is part of routine investor relations activities and does not contain any new material information.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/VIRTUOSO_01072026141448_Final.pdf	\N
106683191	WEIZMANIND	2026-07-01 14:25:15.152613	The notice sets the 39th Annual General Meeting for 23 July 2026 via video conference and designates 16 July 2026 as the record date for dividend entitlement for the FY ending March 31, 2026. It also establishes 16 July 2026 as the cut‑off date for e‑voting eligibility.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/WEIZMANNIND_01072026142048_WLNoticeofAGM.pdf	\N
106683188	CGCL	2026-07-01 14:25:19.008938	Capri Global Capital Limited announced that a newspaper advertisement has been published regarding a special window for re‑lodging transfer requests of physical shares, as per SEBI circular, and the notice will be posted on its website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/CGCL_01072026141923_CLRelodgementoftransfer.pdf	\N
106683195	TMPV	2026-07-01 14:26:32.013179	Tata Motors Passenger Vehicles posted a 46% YoY rise in Q1 FY27 sales to 182,574 units, driven by strong domestic and EV growth. The company highlighted robust demand, record EV volumes, and confidence in sustaining momentum through the year.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/TATAMOTORSSJS_01072026142534_PVSALESRELEASE.pdf	\N
106683194	WEIZMANIND	2026-07-01 14:26:34.612201	The company announced the date, time, and mode of its 39th Annual General Meeting, along with the record date, book closure period, and e‑voting cut‑off for dividend entitlement. Shareholders must be registered by 16 July 2026 to receive the dividend and to vote electronically.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/WEIZMANNIND_01072026142424_WLNoticeofAGM.pdf	\N
106683193	GAIL	2026-07-01 14:26:39.434313	GAIL announced that Shri S.K. Sinha assumed the role of Director (Finance) effective July 1, 2026. He brings over three decades of finance experience, including prior service as Executive Director (Finance & Accounts) and a strong record in financial governance and digital transformation.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/Himanshugail_01072026142526_Press_Release.pdf	\N
106683196	ASHIMASYN	2026-07-01 14:27:47.465374	The company announced the appointment of Ms. Uttara Chintan Parikh as an additional non‑executive non‑independent director, effective July 1, 2026, subject to shareholder approval, along with standard disclosures of her background and relationships.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ASHIMASYN_01072026142648_Intimation_ChangeinManagement.pdf	\N
106683199	SALSTEEL	2026-07-01 14:29:51.948178	SAL Steel announced the appointment of Anil Kumar Singh as its new Chief Financial Officer, effective July 1, 2026. The board approved the appointment following recommendations from the Nomination and Remuneration Committee.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/SALSTEEL_01072026142916_Outcomes_of_Board_Meeting_01072026.pdf	\N
106683203	CSLFINANCE	2026-07-01 14:32:55.550602	CSL Finance reported a 15% YoY increase in AUM to about INR 1,510 crore as of June 2026, along with fresh funding of INR 110 crore and a strong liquidity surplus of INR 175 crore. The company also disclosed a 44% capital adequacy ratio and a 70:30 loan portfolio mix.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/CSLFINANCELIMITED_01072026143147_Investor_Update_Q1_FY27.pdf	\N
106683201	NCC	2026-07-01 14:33:00.710855	NCC Limited has communicated to physical shareholders the requirement to update KYC details with its registrar, KFin Technologies, to ensure continued dividend payments and electronic processing of entitlements. The notice outlines specific forms and submission methods, and warns that incomplete KYC will restrict access to payments after April 1, 2024.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/NCC_01072026143125_Ltr_to_SE_1July26.pdf	\N
106683209	PFS	2026-07-01 14:35:05.579575	PFS announced the resignation of MD&CEO Shri R Balaji effective 30 June 2026 and the appointment of Shri Rajiv Malhotra as MD&CEO (Addl. Charge) effective 1 July 2026. The change follows prior communications dated 30 March and 4 June 2026 and is reflected in the company's filings.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/PFS_01072026143307_ChargeofMDCEOsigned.pdf	\N
106683208	DBOL	2026-07-01 14:35:12.500291	Dhampur Bio Organics announced the resignation of Vice President Santosh Mani, effective June 30, 2026, citing personal reasons, and filed the required regulatory disclosures. The resignation details were submitted to BSE and NSE as per SEBI Listing Regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/DBOLTD_01072026143047_Intimation_Resignation_SantoshMani_DBOtoSE.pdf	\N
106683212	JKLAKSHMI	2026-07-01 14:37:20.4229	JK Lakshmi Cement announced a dividend of ₹6.50 per share (130% of face value) with a record date of 17 July 2026, payable within 3‑4 weeks after the AGM. The dividend will be distributed to shareholders listed on the record date, including those holding shares in dematerialised form based on beneficial ownership details.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/JKLASHMI_01072026143538_Intimation_Record_Date.pdf	\N
106683211	DBOL	2026-07-01 14:37:24.515793	The company announced the resignation of Mr. Santosh Mani, Vice President – Operations (Specialty Sugar Packaging), effective June 30, 2026, citing personal reasons. The resignation is disclosed under SEBI Listing Regulations with required filings attached as annexures.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/DBOL_ROID_90885_KMP_Doc.zip	\N
106683216	TOLINS	2026-07-01 14:39:29.841032	Tolins Tyres' wholly owned subsidiary Terra Rubber has signed a purchase agreement to acquire plant and machinery from Cochin Reclaim for capacity expansion and backward integration, with no material restrictions or related‑party concerns. The transaction is routine and does not alter management or control of the listed entity.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/tolins_01072026143852_Purchase_Agreement_01072026.pdf	\N
106683215	MALUPAPER	2026-07-01 14:39:36.660329	Malu Paper Mills disclosed that its trading window will close on July 1, 2026, preventing directors and connected persons from trading until 48 hours after the un-audited Q1 results are announced. The board meeting date for reviewing those results will be communicated later.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MALUPAPER_01072026143836_Closure_of_trading_window_30062026.pdf	\N
106683217	DBOL	2026-07-01 14:42:53.006818	\N	\N	\N	\N	\N
106683220	DRREDDY	2026-07-01 14:46:11.893525	The company announced the notice of its 42nd Annual General Meeting scheduled for July 23, 2026, together with detailed e‑voting procedures and compliance disclosures. The filing provides procedural updates without new financial or operational information.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/DRREDDY_01072026144453_NP_Advertisement_-_Notice_signed.pdf	\N
106683221	SALSTEEL	2026-07-01 14:47:15.950431	SAL Steel announced the appointment of Shri Anil Kumar Singh as its Chief Financial Officer, effective July 1, 2026, following regulatory approvals. The move aims to strengthen the company's financial leadership with a seasoned executive experienced in steel and related industries.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/SALSTEEL_01072026144608_Regulation_30_Appointment_of_CFO.pdf	\N
106683222	TURTLEMINT	2026-07-01 14:48:20.114723	The filing identifies the Chairperson & Managing Director, the Executive Director & COO, the CFO, and the Company Secretary & Compliance Officer as authorized to assess materiality of events for disclosure to BSE and NSE. Contact details and the company's materiality policy are also made available on its website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/TURTLEMINT_01072026144643_Intimationunderreg305Authorityformaterialityofevents.pdf	\N
106683225	INTELLECT	2026-07-01 14:51:24.908529	Intellect announced that its eMACH.ai platform secured #1 rankings across eight banking technology categories in the 2026 IBSi Sales League Table, with strong performance in North America and multiple consecutive leadership positions. The release also highlighted its #2 ranking in India and #3 global geographic spread, underscoring expanding market reach.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/INTELLECT_01072026145016_PressReleaseDated01072026.pdf	\N
106683224	SMSPHARMA	2026-07-01 14:51:27.642708	The company clarified that the recent surge in trading volume is purely market-driven and that it has disclosed all material information, with no withheld price-sensitive data. It reaffirmed compliance with SEBI disclosure norms and invited the exchange to record the clarification.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SMSPHARMA_01072026145019_Clarification_to_NSE_01072026.pdf	\N
106683228	BHAGYANGR	2026-07-01 14:53:33.262564	Bhagyanagar India Limited announced that it has filed newspaper advertisements notifying shareholders of an upcoming extraordinary general meeting scheduled for July 23, 2026, to be conducted via video conference, and outlined the procedures for participation and voting in compliance with SEBI and MCA regulations.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/BHAGYANGR_01072026145224_NP_01-07-2026_signed.pdf	\N
106683227	TICL	2026-07-01 14:53:38.060611	The company announced that CEO Jasodeb Chakraborty will resign effective 30 June 2026 due to ill health. The resignation is disclosed in compliance with SEBI LODR regulations, with supporting annexures.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/TCLCONS_01072026145210_ResignationOfCEO30062026.pdf	\N
106683226	RUCHIRA	2026-07-01 14:53:43.335265	Ruchira Papers Ltd. announced a special one‑year window (Feb 5 2026‑Feb 4 2027) to re‑lodgement transfer requests for physical shares sold before Apr 1 2019, in compliance with SEBI regulations. The notice includes supporting social media posts and newspaper ads and is intended for exchange record‑keeping.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/RUCHIRA_01072026145154_signed_sw_nse.pdf	\N
106683229	TATACAP	2026-07-01 14:59:06.23469	The company announced the issuance of a postal ballot notice and detailed remote e‑voting procedures for its upcoming Annual General Meeting, making the notice accessible via its website and stock exchange portals. It outlined the voting period, eligibility, and the process for shareholders to cast votes electronically.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/TATACAPITAL_01072026145805_StockExchangeIntimationPostalballotnewspaperpublicationsigned.pdf	\N
106679627	GENUSPOWER	2026-07-01 15:00:10.487418	The company filed a regulatory disclosure confirming that its promoters and related parties have not created any new encumbrances on its shares beyond those already disclosed for the financial year ending March 31, 2026. The filing complies with SEBI’s Regulation 31(4) and 31(5) and lists all promoter entities.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026165054_GENUSPOWER.pdf	\N
106683231	ITI	2026-07-01 15:00:14.218289	ITI Limited disclosed that the Government of India has assigned Shri Rajesh Rai as additional charge Director (Production) effective 1 July 2026 for up to three months, until a regular appointment is made. The order is issued under SEBI regulations and does not affect any existing restrictions on his directorship.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ITI_01072026145842_SE_Addtl_DP_Signed_.pdf	\N
106683230	EICHERMOT	2026-07-01 15:00:20.006654	Eicher Motors reported a 27% YoY increase in motorcycle sales for June 2026, driven by strong domestic demand and the launch of its first electric model, the Flying Flea C6. The company also highlighted milestones including its 125th anniversary celebrations and new Himalayan Basecamp events, underscoring continued brand momentum.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/EICHERMOT_01072026145754_EMLMonthlyBusinessUpdate1stJuly2026Signed.pdf	\N
106679642	RELIANCE	2026-07-01 15:01:24.761495	Reliance Welfare Association, a promoter entity, declared that it has not placed any encumbrance on its RIL shares during FY 2025‑26, complying with SEBI takeover regulations. The statement was filed with NSE and BSE and will be recorded for regulatory purposes.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026165454_RELIANCE.pdf	\N
106683235	JAMNAAUTO	2026-07-01 15:01:28.656824	Jamna Auto Industries announced the results of its e‑voting process for the special resolution reappointing Gautam Mukherjee as an independent director for a second term, which was passed with over 98% votes in favor. The scrutinizer's report confirms the resolution was carried with the required majority.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/JAMNAAUTO_01072026145411_Voting_Results.pdf	\N
106679634	JIOFIN	2026-07-01 15:01:33.866076	Reliance Industries Holding Private Limited declared that its promoter group has not placed any encumbrance on its Jio Financial Services Limited shares during FY 2025‑26, as required under SEBI takeover regulations. The filing is a routine compliance update with no immediate operational or financial implications.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026165253_JIOFIN.pdf	\N
106683233	MAHASTEEL	2026-07-01 15:01:36.686788	Mahamaya Steel Industries reported June 2026 sales of 17,485.14 metric tons. The figure was disclosed in a regulatory filing to the stock exchanges.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/MAHASTEEL_01072026145932_MAHASTEEL_513554_SALES_ANNOUNCEMENT_01072026.pdf	\N
106683232	KARMAENG	2026-07-01 15:01:39.595164	KARMA ENERGY LIMITED announces that its 19th Annual General Meeting will be held on July 23, 2026 via video conference, with July 16, 2026 set as the record and cut‑off date for shareholder eligibility. The notice invites shareholders to acknowledge receipt and participate in the meeting.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/KARMAENG_01072026145857_KELAGMRDDTD01JUL26.pdf	\N
106679649	JIOFIN	2026-07-01 15:02:44.80994	Reliance Welfare Association, part of the promoter group of Jio Financial Services, declared that no encumbrances have been placed on its Jio Financial Services Limited shares during FY 2025-26, as required under SEBI takeover regulations. This compliance statement aims to reassure investors of clean shareholding.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026165703_JIOFIN1.pdf	\N
106679658	KARURVYSYA	2026-07-01 15:03:48.618427	The company filed a regulatory disclosure under SEBI's Substantial Acquisition of Shares and Takeovers Regulations regarding share purchases by its promoters. This filing signals potential promoter confidence but does not provide details on the transaction size or terms.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026170105_KARURVYSYA.pdf	\N
106683236	LODHA	2026-07-01 15:04:10.427727	Lodha Developers announced the date, format, and voting procedures for its 31st Annual General Meeting scheduled for August 14, 2026, and recommended a final dividend of ₹4.25 per share. The notice also detailed e‑voting options, record date requirements, and dividend payment procedures for shareholders.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/LODHA_01072026145731_Lodha_Newspaper_advt_01072026.pdf	\N
106679664	JUSTDIAL	2026-07-01 15:05:11.123417	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026170257_JUSTDIAL.pdf	\N
106679680	THELEELA	2026-07-01 15:06:14.890801	The promoter group confirms no additional encumbrances on their holdings in Leela Palaces Hotels & Resorts Ltd during FY 2025-26 and pledges to disclose any future encumbrances promptly. The filing covers multiple promoter entities and is submitted to BSE and NSE.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026171043_THELEELA.pdf	\N
106683237	ADANIGREEN	2026-07-01 15:06:18.956661	Adani Green Energy announced that Pramath Nath, its Chief People Officer, will step down effective June 30, 2026 to take a new role within the Adani group. The company disclosed the change in compliance with SEBI regulations and will update relevant filings.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ADANIGREEN_01072026150322_Letters.pdf	\N
106679867	UFBL	2026-07-01 15:07:19.71956	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026180320_UFBL.pdf	\N
106683239	TICL	2026-07-01 15:07:23.304418	The company announced that CEO Jasodeb Chakraborty will resign effective 30 June 2026 due to ill health and ongoing medical issues. The resignation has been accepted and disclosed in compliance with SEBI regulations.	Bearish	Negative	https://nsearchives.nseindia.com/corporate/TICL_ROID_90888_KMP_Doc.zip	\N
106683238	TITAN	2026-07-01 15:07:38.528872	Titan Company Limited announces the publication of newspaper advertisements concerning its 42nd Annual General Meeting and the associated record date, requesting that the notice be recorded.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/TITAN_01072026150433_SEnewspaperadforagmintimation.pdf	\N
106683240	VSSL	2026-07-01 15:09:42.41088	The company announced the allotment of 15,500 equity shares, including 7,750 bonus shares, to eligible employees under its 2016 and 2020 Employee Stock Option Plans, effective July 1, 2026. The shares will rank pari passu with existing shares and the board meeting concluded within the same day.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/VSSL_01072026150439_vssl_sd.pdf	\N
106683241	ASTRAL	2026-07-01 15:10:45.374411	Astral Limited announced that the transcript of its June 27, 2026 earnings call with analysts and institutional investors has been uploaded to its investor relations website. The company provided no new financial details, leaving investors with only a record of the discussion.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ASTRAL_01072026150850_Transcript.pdf	\N
106683242	SEJALLTD	2026-07-01 15:12:06.864288	The company announced a special one‑year window for transfer and dematerialisation of physical shares sold before April 1, 2019, and issued a public notice inviting claims on property matters. These actions are procedural and do not directly affect current financial performance.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SEJALLTD_01072026151010_Newspaper_Publication.pdf	\N
106679962	EDELWEISS	2026-07-01 15:14:12.950568	Promoter Rashesh Shah confirms that no new encumbrances have been placed on Edelweiss Financial Services' shares during the fiscal year ending March 31, 2026. The declaration complies with SEBI's Substantial Acquisition of Shares regulations.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026183942_EDELWEISS.pdf	\N
106679985	STLTECH	2026-07-01 15:15:13.633594	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026184354_STLTECH1.pdf	\N
106679967	STLTECH	2026-07-01 15:15:14.059645	This announcement is a scanned image document. The local AI cannot extract text from scanned images without OCR.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/team_bbodade_29062026184206_STLTECH.pdf	\N
106683246	MAHLIFE	2026-07-01 15:17:06.012123	Mahindra Lifespace Developers (MAHLIFE) announced that its 27th Annual General Meeting will be held on July 23, 2026 through a video conference. The company also disclosed that the notice, integrated annual report, e‑voting facility, and KYC update request have been dispatched and uploaded to its website.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MAHLIFE1_01072026151143_SEintimation_postdispatch_BPsg.pdf	\N
106683245	ARROWGREEN	2026-07-01 15:17:10.84704	Arrow Greentech announced that it has been granted an Indian patent (No. 589622) for its Color Shift Base Film and manufacturing method, covering the territory of India. The patent, filed in March 2021, is valid for 20 years from that filing date.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ARROWGREEN_01072026151443_GrantOfPatent101072026.pdf	\N
106683252	KTKBANK	2026-07-01 15:18:15.123624	KTKBANK disclosed provisional business metrics for June 30, 2026, showing YoY increases in CASA, deposits, and gross advances, with slight QoQ declines in certain ratios. The figures are provisional pending limited auditor review.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/KTKBANK_01072026151543_PKBPJ.pdf	\N
106683251	ARROWGREEN	2026-07-01 15:18:17.911084	Arrow Greentech Limited has been granted an Indian patent (No. 593008) for a graphene‑based security thread, its manufacturing method, and applications, covering a 20‑year term from June 2020. The patent certificate is attached, and renewal fees are due annually on June 20.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/ARROWGREEN_01072026151711_GrantOfPatent201072026.pdf	\N
106683250	TAJGVK	2026-07-01 15:18:20.318924	Taj GVK Hotels and Resorts announced receipt of the occupancy certificate for its upcoming 256‑key luxury hotel in North Bengaluru, with operations slated for September 2026. The company also highlighted a 4‑acre adjacent land parcel for future Phase II development, underscoring growth potential in Bengaluru’s corporate and leisure markets.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/TAJGVK_01072026151648_PressRelease010726.pdf	\N
106683248	TNPL	2026-07-01 15:18:24.022258	The company announced newspaper advertisements regarding the appointment of two new directors, R Kannan and N Venkatesh, as per SEBI regulations. The appointments were published in Business Standard and Indhu Tamizh on 1st July 2026.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/TNPL_01072026151457_PBIntBallotNewspaper01072026CSDSC.pdf	\N
106683247	GILLETTE	2026-07-01 15:18:27.28784	Gillette India announced that its Legal Head, Ghanashyam Hegde, will move to a regional role at P&G effective July 1, 2026, and will exit the India leadership team after June 30, 2026. The change was communicated in a filing to BSE and NSE.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/GILLETTE_01072026151500_GILSEIntimationChangeinSMP01072026.pdf	\N
106683255	GRADIENTE	2026-07-01 15:19:29.9088	The company announced that the trading window will be closed for insiders from 1st July 2026 until 48 hours after the unaudited Q1 results are released, with the board meeting date to be communicated later. This compliance measure does not provide new financial information or operational updates.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/GRADIENTE_01072026151749_Intimation_Closure_of_trading_window.pdf	\N
106683254	ABREL	2026-07-01 15:19:55.593233	The company issued a notice convening its 129th Annual General Meeting and releasing the integrated annual report for FY 2025‑26, outlining the agenda items including financial statements, dividend, director appointment, and auditor remuneration. The filing complies with SEBI and MCA regulations and provides electronic access to shareholders.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/CENTURYTEX_01072026151832_Intimation.pdf	\N
106683253	UNIENTER	2026-07-01 15:19:58.4419	Uniphos Enterprises announced the date and details of its 57th Annual General Meeting, including a recommended dividend of 175% (₹3.50 per share) and a record date of July 17, 2026 for dividend entitlement. The company also disclosed that the 2025‑26 Annual Report and related documents will be distributed to shareholders via email and web link.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/AmitJain_01072026150404_INTIMATION_OF_57TH_ANNUAL_GENERAL_MEETING_AND_RECORD_DATE.pdf	\N
106683256	TEAMLEASE	2026-07-01 15:20:58.73817	\N	\N	\N	\N	\N
106683259	THANGAMAYL	2026-07-01 15:22:06.143898	Thangamayil Jewellery announced its 26th Annual General Meeting scheduled for 29 July 2026, where shareholders will consider the audited financials, a proposed dividend of Rs 18 per share, and revisions to executive remuneration. The notice also seeks shareholder approval to raise deposits up to Rs 49.56 billion for the upcoming financial year.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/THANGAMAYL_01072026152101_26THAGMNOTICE.pdf	\N
106683258	NIITMTS	2026-07-01 15:22:11.044236	NIIT Learning Systems Limited announced it has been ranked among the 2026 Top 20 AI Coaching & Learner Support Tools companies for the second consecutive year. The company also unveiled its AI‑Ready L&D Enterprise Series, positioning it as a leader in AI‑driven learning solutions.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/NLSL_01072026152056_NLSLPressRelease01072026.pdf	\N
106683260	KTKBANK	2026-07-01 15:23:15.257296	The filing confirms the appointment of Sham K as Company Secretary and Compliance Officer, effective February 27, 2023, and reaffirms Integrated Registry Management Services as the bank's registrar and share transfer agent. No financial or operational details were provided.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/KTKBANK_01072026152055_Regulationsd.pdf	\N
106683261	LLOYDSME	2026-07-01 15:24:20.746541	Lloyds Metals & Energy announced record Q1FY27 operational results, posting a 53% YoY increase in iron ore production to 6.05 million tonnes, a 131% rise in DRI to 182,000 tonnes, and first copper output of 2,754 tonnes, while pellet production reached 1.7 million tonnes. The update also highlighted full capacity utilization of new plants and expansion plans, underscoring robust growth across its core segments.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/LLOYDSME_01072026152247_20260701_Intimation_Operational_Update_3MFY27.pdf	\N
106683262	TEAMLEASE	2026-07-01 15:25:27.930932	TeamLease Services announced a buyback of up to 1.49 million equity shares at ₹1,600 each, representing about 8.87% of its paid‑up capital, with a total offer size of ₹238 crore. The buyback will be executed through a tender offer and is subject to regulatory approvals.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/TEAMLEASE_01072026152310_TeamLeasePublicAnnouncmentForBuyback.pdf	\N
106683266	POKARNA	2026-07-01 15:26:32.377742	Pokarna Limited announced the notice for its 35th Annual General Meeting on 27 July 2026, accompanied by the audited standalone and consolidated financial statements for FY 2025-26, a proposed dividend of ₹0.60 per share, and the re‑appointment of key directors and managerial personnel. The notice also includes special resolutions for director appointments and re‑appointments of the Chairman and Managing Director.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/POKARNA_01072026152540_Pokarna_Notice.pdf	\N
106683265	PARACABLES	2026-07-01 15:26:36.905697	Paramount Communications Limited has appointed Adfactors PR Private Limited as its Investor Relations agency effective July 1, 2026, as per SEBI Regulation 30. The appointment is disclosed with no related party transactions or significant terms.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/PARACABLES_01072026152413_PCL_Intimation_of_Adfactor_appointment.pdf	\N
106683263	MSUMI	2026-07-01 15:26:41.224826	The Board approved the appointment of P.R. Mehra & Co. as internal auditor and M.R. Vyas & Associates as cost auditor for the financial year 2026‑27. These appointments are disclosed under SEBI regulations and become effective from July 1, 2026.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MSWIL_01072026152435_DisclosureInternalandcost.pdf	\N
106683267	MSUMI	2026-07-01 15:27:45.159891	Motherson Sumi Wiring India Limited announced the reappointment of S.R. Batliboi & Co. LLP as its statutory auditor for a four‑year term, pending shareholder approval. The notice, issued under SEBI Regulation 30, includes detailed disclosures about the auditor's profile and term.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/MSWIL_01072026152649_StatutoryAuditors.pdf	\N
106683271	ZENSARTECH	2026-07-01 15:31:57.454249	Zensar Technologies announced the 63rd Annual General Meeting to be held via video conference on July 30, 2026, and set July 17, 2026 as the record date for final dividend entitlement.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ZENSARTECH_01072026152358_SEIntimationNP.pdf	\N
106683272	JTLIND	2026-07-01 15:33:02.244672	JTL Industries reported Q1 FY27 sales volume of 118,513 MT, a 18% YoY increase driven by capacity expansion and strong demand. The company highlighted growth in value‑added products and export markets, indicating robust operational momentum.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/JTLIND_01072026153126_BusinessPerformanceUpdateQ1FY27.pdf	\N
106683274	JSWINFRA	2026-07-01 15:34:06.746914	JSW Infrastructure completed a ₹7,503 crore qualified institutions placement, raising funds from marquee global and domestic investors to support its growth and expansion plans. The offering was oversubscribed ~6.7 times and will fund a multi‑year capital expenditure program and increase cargo capacity.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/JSWINFRA_01072026153230_SE_Intimation_for_press_release_QIP.pdf	\N
106683280	SIGIND	2026-07-01 15:37:10.642105	The company announced that trading in its shares will be suspended from July 1, 2026 until 48 hours after the release of its quarterly unaudited financial results for the quarter ending June 30, 2026, as required by SEBI regulations. This closure applies to promoters, directors, and other insiders.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/SIGIND_01072026153613_Noticeoftradingwindowclosure2026.pdf	\N
106683278	VENTIVE	2026-07-01 15:37:14.908173	Ventive Hospitality announced that its representatives will attend a non‑deal roadshow in Dubai on July 6, 2026, as part of an investor conference, with no unpublished price‑sensitive information to be disclosed. The notice was filed with BSE and NSE under SEBI's Regulation 30.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/VENTIVE_01072026153459_Intimation_of_Non-deal_Roadshow__NDR__in_Dubai.pdf	\N
106683283	ABREL	2026-07-01 15:40:23.660082	Aditya Birla Real Estate Ltd. filed its FY 2025‑26 Business Responsibility and Sustainability Report, outlining ESG performance, sustainability initiatives, and consolidated disclosures. The report, independently assured by TUV India, underscores the company's net‑zero ambition, growth metrics, and alignment with UN SDGs.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/CENTURYTEX_01072026153625_IntimationBRSR.pdf	\N
106683284	UNIENTER	2026-07-01 15:44:29.009356	The company announced the date and details of its 57th Annual General Meeting, including a recommended dividend of 175% (₹3.50 per share) and a record date of July 17, 2026 for dividend entitlement. It also disclosed that the 2025-26 Annual Report and related documents will be distributed to shareholders via email and web link.	Bullish	Positive	https://nsearchives.nseindia.com/corporate/AmitJain_01072026154239_INTIMATION_OF_57TH_ANNUAL_GENERAL_MEETING_AND_RECORD_DATE.pdf	\N
106683290	ANUP	2026-07-01 15:53:36.622472	The company announced a schedule of upcoming investor meetings, including a one‑on‑one with Toro Wealth Managers on July 6, 2026, and disclosed that no unpublished price‑sensitive information will be shared. The meetings are part of routine investor relations activities and are subject to change.	Neutral	Neutral	https://nsearchives.nseindia.com/corporate/ANUP_01072026155110_IntimationInvestorMeet.pdf	\N
106683289	SATIN	2026-07-01 15:53:40.211888	Infomerics has reaffirmed the IVR A/ Stable rating for Satin Creditcare Network's proposed INR 750 crore non‑convertible debentures, citing comfortable capitalisation, healthy AUM growth and diversified funding, while noting average asset quality and regulatory risks.	Neutral	Positive	https://nsearchives.nseindia.com/corporate/SATIN_01072026155134_SATIN.pdf	\N
\.


--
-- Data for Name: processed_corporate_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.processed_corporate_actions (id, symbol, purpose, record_date, created_at) FROM stdin;
\.


--
-- Data for Name: push_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.push_subscriptions (id, user_id, endpoint, keys_p256dh, keys_auth, created_at) FROM stdin;
2	1	https://fcm.googleapis.com/fcm/send/cxy0m-j2IUg:APA91bF4CR345WiURU0VSbiIjq1xXH_nkAwoavpdPIo7A-p-qCiXDrFbCp2C8zjaCyYosTqluTY8pHqx1htkf2XIOVsHW6UoDE7KAtfvl4Jc11R7iusqw-RgMvYzsDz3IHRUTcDidZKk	BJgK3EDuQbpa7t9MRgX7MAgUxaK986sU4CdHXh_O1Zuug-l0WpyhgWYeeJFORQujiTMm_DwQsg_N-liCNuN12K4	L-_k1ik4FPKe-W4c71HCFQ	2026-06-29 17:45:05.366639
237	1	https://fcm.googleapis.com/fcm/send/dbGeJeUKvBA:APA91bERvzS_rm-D0rwsea5dgqeeq9-Fr5Rbkvm-iI-5XT_HyNEFL0f_ioCM1qTtTqPe4XJiacUzaDSXjMyhEnLs6tar7PDbcCqNu-RyS7seYGjwn1f5_3HQO_n-u7duk98k0UbV2cBw	BI_gqXYvSJR14T8Jafmj9joF0k7Fr-A8rnY5uNNmV1Ay-VnNG8Xkcug8oa7C6_wRITDWYsubrERAxiZZCgFa_yo	obGPWofw-NeZXsX8ZXzTDw	2026-06-29 23:59:13.306497
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, created_at, role) FROM stdin;
2	yyatik_me24@thapar.edu	$2b$10$QxBawYCTEYenryHt5kOitOLttxk7PVLzu7wUq7m.8E3YVKhhDCgAy	Yatik	2026-06-26 11:34:46.5029	user
1	deepaksahu7404@gmail.com	$2b$10$JlLGIVw1g0rVJmxX0HRDKetCSpXkFu76bzNq6woQcCEBP1/zPfCay	Deepak Sahu	2026-06-24 10:40:31.025285	admin
3	deepaksahu2376@gmail.com	$2b$10$z9Fe0/c88ck94I.8Zb89b.oVj2AKN3WlxX2sorC1k71nsB9a44NqO	System Admin	2026-06-30 13:14:20.921813	admin
\.


--
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, user_id, symbol, company_name, created_at) FROM stdin;
8	1	BAJAJ-AUTO	BAJAJ-AUTO	2026-06-24 19:25:33.877963
9	1	CYIENT	CYIENT	2026-06-24 19:25:46.821168
10	1	KAJARIACER	KAJARIACER	2026-06-24 19:25:57.970129
11	1	SBIN	SBIN	2026-06-24 19:31:59.437885
12	1	TEXRAIL	TEXRAIL	2026-06-25 09:19:34.749584
13	1	KEC	KEC	2026-06-30 08:33:00.938133
\.


--
-- Name: ai_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_settings_id_seq', 1, true);


--
-- Name: ai_usage_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_usage_stats_id_seq', 96, true);


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alerts_id_seq', 41, true);


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 1, true);


--
-- Name: holdings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.holdings_id_seq', 7, true);


--
-- Name: otps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otps_id_seq', 11, true);


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_id_seq', 7, true);


--
-- Name: processed_corporate_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.processed_corporate_actions_id_seq', 1, false);


--
-- Name: push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.push_subscriptions_id_seq', 450, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: wishlists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlists_id_seq', 13, true);


--
-- Name: ai_settings ai_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_stats ai_usage_stats_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_stats
    ADD CONSTRAINT ai_usage_stats_endpoint_key UNIQUE (endpoint);


--
-- Name: ai_usage_stats ai_usage_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_stats
    ADD CONSTRAINT ai_usage_stats_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: holdings holdings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holdings
    ADD CONSTRAINT holdings_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: processed_announcements processed_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_announcements
    ADD CONSTRAINT processed_announcements_pkey PRIMARY KEY (seq_id);


--
-- Name: processed_corporate_actions processed_corporate_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_corporate_actions
    ADD CONSTRAINT processed_corporate_actions_pkey PRIMARY KEY (id);


--
-- Name: processed_corporate_actions processed_corporate_actions_symbol_purpose_record_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_corporate_actions
    ADD CONSTRAINT processed_corporate_actions_symbol_purpose_record_date_key UNIQUE (symbol, purpose, record_date);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_user_id_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_endpoint_key UNIQUE (user_id, endpoint);


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
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- Name: wishlists wishlists_user_id_symbol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_symbol_key UNIQUE (user_id, symbol);


--
-- Name: alerts alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: holdings holdings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holdings
    ADD CONSTRAINT holdings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: positions positions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: push_subscriptions push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict F3ODaHkGQijHarkkP62LspcifAnYCangh4kCj9WlJ83EvJofyfjehBO0U4KsDg9

