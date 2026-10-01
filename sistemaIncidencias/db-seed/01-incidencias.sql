--
-- PostgreSQL database dump
--

\restrict XedFV9qcaEaKVj8yloKMRPFX8VP0j2YRhg1Taaz26qy5viVkcBdp8amavrPvfye

-- Dumped from database version 14.24 (Ubuntu 14.24-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 16.15

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: archivos; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.archivos (
    id_archivo integer NOT NULL,
    nombre character varying(255) NOT NULL,
    tipo character varying(100),
    tamanio integer NOT NULL,
    contenido bytea NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.archivos OWNER TO root;

--
-- Name: archivos_id_archivo_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.archivos_id_archivo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.archivos_id_archivo_seq OWNER TO root;

--
-- Name: archivos_id_archivo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.archivos_id_archivo_seq OWNED BY public.archivos.id_archivo;


--
-- Name: areas; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.areas (
    id_area integer NOT NULL,
    descripcion character varying(250) NOT NULL,
    activo smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.areas OWNER TO root;

--
-- Name: areas_id_area_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.areas_id_area_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.areas_id_area_seq OWNER TO root;

--
-- Name: areas_id_area_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.areas_id_area_seq OWNED BY public.areas.id_area;


--
-- Name: articulos; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.articulos (
    id_articulo integer NOT NULL,
    id_area integer NOT NULL,
    id_categoria integer NOT NULL,
    descripcion character varying(250) NOT NULL,
    activo smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.articulos OWNER TO root;

--
-- Name: articulos_archivos; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.articulos_archivos (
    id_articulo integer NOT NULL,
    id_archivo integer NOT NULL
);


ALTER TABLE public.articulos_archivos OWNER TO root;

--
-- Name: articulos_id_articulo_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.articulos_id_articulo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articulos_id_articulo_seq OWNER TO root;

--
-- Name: articulos_id_articulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.articulos_id_articulo_seq OWNED BY public.articulos.id_articulo;


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.categorias (
    id_categoria integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    activo smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.categorias OWNER TO root;

--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.categorias_id_categoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_categoria_seq OWNER TO root;

--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.categorias_id_categoria_seq OWNED BY public.categorias.id_categoria;


--
-- Name: estados; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.estados (
    id_estado integer NOT NULL,
    descripcion character varying(255) NOT NULL,
    activo smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.estados OWNER TO root;

--
-- Name: estados_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.estados_id_estado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estados_id_estado_seq OWNER TO root;

--
-- Name: estados_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.estados_id_estado_seq OWNED BY public.estados.id_estado;


--
-- Name: incidencias; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.incidencias (
    id_incidencia integer NOT NULL,
    id_articulo integer NOT NULL,
    id_estado integer NOT NULL,
    creado_por integer NOT NULL,
    asignado_a integer NOT NULL,
    creado timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    prioridad integer DEFAULT 1 NOT NULL,
    descripcion_pedido character varying(250),
    descripcion_resolucion character varying(250)
);


ALTER TABLE public.incidencias OWNER TO root;

--
-- Name: incidencias_archivos; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.incidencias_archivos (
    id_incidencia integer NOT NULL,
    id_archivo integer NOT NULL
);


ALTER TABLE public.incidencias_archivos OWNER TO root;

--
-- Name: incidencias_estados; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.incidencias_estados (
    id_pedidos_estados integer NOT NULL,
    id_incidencia integer NOT NULL,
    id_estado integer NOT NULL,
    fecha_hora_estado timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.incidencias_estados OWNER TO root;

--
-- Name: incidencias_estados_id_pedidos_estados_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.incidencias_estados_id_pedidos_estados_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incidencias_estados_id_pedidos_estados_seq OWNER TO root;

--
-- Name: incidencias_estados_id_pedidos_estados_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.incidencias_estados_id_pedidos_estados_seq OWNED BY public.incidencias_estados.id_pedidos_estados;


--
-- Name: incidencias_id_incidencia_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.incidencias_id_incidencia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incidencias_id_incidencia_seq OWNER TO root;

--
-- Name: incidencias_id_incidencia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.incidencias_id_incidencia_seq OWNED BY public.incidencias.id_incidencia;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    id_area integer NOT NULL,
    nombres character varying(250) NOT NULL,
    apellidos character varying(250) NOT NULL,
    usuario character varying(255) NOT NULL,
    contrasenia character varying(255) NOT NULL,
    avatar character varying(255) NOT NULL,
    rol integer NOT NULL,
    activo smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.usuarios OWNER TO root;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO root;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: archivos id_archivo; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.archivos ALTER COLUMN id_archivo SET DEFAULT nextval('public.archivos_id_archivo_seq'::regclass);


--
-- Name: areas id_area; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.areas ALTER COLUMN id_area SET DEFAULT nextval('public.areas_id_area_seq'::regclass);


--
-- Name: articulos id_articulo; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.articulos ALTER COLUMN id_articulo SET DEFAULT nextval('public.articulos_id_articulo_seq'::regclass);


--
-- Name: categorias id_categoria; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id_categoria SET DEFAULT nextval('public.categorias_id_categoria_seq'::regclass);


--
-- Name: estados id_estado; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.estados ALTER COLUMN id_estado SET DEFAULT nextval('public.estados_id_estado_seq'::regclass);


--
-- Name: incidencias id_incidencia; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.incidencias ALTER COLUMN id_incidencia SET DEFAULT nextval('public.incidencias_id_incidencia_seq'::regclass);


--
-- Name: incidencias_estados id_pedidos_estados; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.incidencias_estados ALTER COLUMN id_pedidos_estados SET DEFAULT nextval('public.incidencias_estados_id_pedidos_estados_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: archivos; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.archivos (id_archivo, nombre, tipo, tamanio, contenido, fecha_creacion) FROM stdin;
\.


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.areas (id_area, descripcion, activo) FROM stdin;
1	Legales	1
2	Personal	1
3	Sistemas	1
4	Hacienda	1
5	Finanzas	1
6	Salud y Accion Social	1
7	Desarrollo Urbano	0
\.


--
-- Data for Name: articulos; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.articulos (id_articulo, id_area, id_categoria, descripcion, activo) FROM stdin;
2	1	1	Monitor LG	1
7	2	3	Resma de hojas A43	0
6	3	3	Custom	0
5	2	2	Pantalla 4K	0
1	3	1	Mouse	1
3	4	1	Notebook Lenovo ASUS	1
8	6	19	Articulo Test	0
\.


--
-- Data for Name: articulos_archivos; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.articulos_archivos (id_articulo, id_archivo) FROM stdin;
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.categorias (id_categoria, descripcion, activo) FROM stdin;
1	Perifericos	1
2	Notebooks	1
3	PC Escritorio	1
4	CPU	1
7	nueva	0
8	test	0
9	otra	0
10	daw	0
11	daw	0
12	daw	0
13	daw	0
14	ocho	0
15	custom	0
16	Papeleria	0
6	Equipos de Red	0
5	Almacenamiento	0
17	Custom Categoria	0
18	Categoria Test	0
19	Categoria de prueba editada	1
20	Test	1
21	Postman Test	1
\.


--
-- Data for Name: estados; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.estados (id_estado, descripcion, activo) FROM stdin;
1	Pendiente	1
2	En Proceso	1
4	Cancelada	1
3	Resuelta	1
\.


--
-- Data for Name: incidencias; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.incidencias (id_incidencia, id_articulo, id_estado, creado_por, asignado_a, creado, prioridad, descripcion_pedido, descripcion_resolucion) FROM stdin;
1	1	1	3	3	2026-09-11 15:47:38.751684-03	1	descripción pedido	
3	2	3	2	4	2026-09-13 15:52:15.532034-03	3	No enciende	El usuario responsable dio por finalizada la tarea
4	3	3	2	4	2026-09-13 15:52:51.346357-03	2	No carga la batería	El usuario responsable dio por finalizada la tarea
2	1	3	2	4	2026-09-11 15:50:08.269506-03	1	descripción pedido	El usuario responsable dio por finalizada la tarea
\.


--
-- Data for Name: incidencias_archivos; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.incidencias_archivos (id_incidencia, id_archivo) FROM stdin;
\.


--
-- Data for Name: incidencias_estados; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.incidencias_estados (id_pedidos_estados, id_incidencia, id_estado, fecha_hora_estado) FROM stdin;
1	2	3	2026-09-24 00:57:03.797-03
2	3	3	2026-09-24 00:58:34.504-03
3	2	3	2026-09-26 00:07:00.935-03
4	2	3	2026-09-26 00:07:05.49-03
5	4	3	2026-09-26 00:07:09.802-03
6	2	3	2026-09-26 00:52:40.932-03
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.usuarios (id_usuario, id_area, nombres, apellidos, usuario, contrasenia, avatar, rol, activo) FROM stdin;
1	3	Carlos	Perez	carper@correo.com	fcaddfce9c7c894c376cf085b51ee37b851e89477a2986d2a26b8cc1f484eaf8		2	1
2	3	Carmen	Gomez	cargom@correo.com	be4288567c04f9b827ff17cad92f29fc8ab6667bf235e7ebba558588e2606ee2		2	1
3	3	Pamela	Almeida	pamalm@correo.com	be39221afb177a35f41e3dc590cc630ed8e58773dbb11a29d7a332b9e1eeaad1		1	1
4	1	Esteban	Reniero	estren@correo.com	31c1a3f84de963879b6e6b88e08297fcdeb419133989acf5e91cf5b75db1923f		3	1
\.


--
-- Name: archivos_id_archivo_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.archivos_id_archivo_seq', 1, false);


--
-- Name: areas_id_area_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.areas_id_area_seq', 7, true);


--
-- Name: articulos_id_articulo_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.articulos_id_articulo_seq', 8, true);


--
-- Name: categorias_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.categorias_id_categoria_seq', 21, true);


--
-- Name: estados_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.estados_id_estado_seq', 4, true);


--
-- Name: incidencias_estados_id_pedidos_estados_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.incidencias_estados_id_pedidos_estados_seq', 6, true);


--
-- Name: incidencias_id_incidencia_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.incidencias_id_incidencia_seq', 4, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 5, true);


--
-- Name: archivos archivos_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.archivos
    ADD CONSTRAINT archivos_pkey PRIMARY KEY (id_archivo);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id_area);


--
-- Name: articulos_archivos articulos_archivos_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.articulos_archivos
    ADD CONSTRAINT articulos_archivos_pkey PRIMARY KEY (id_articulo, id_archivo);


--
-- Name: articulos articulos_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.articulos
    ADD CONSTRAINT articulos_pkey PRIMARY KEY (id_articulo);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- Name: estados estados_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.estados
    ADD CONSTRAINT estados_pkey PRIMARY KEY (id_estado);


--
-- Name: incidencias_archivos incidencias_archivos_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.incidencias_archivos
    ADD CONSTRAINT incidencias_archivos_pkey PRIMARY KEY (id_incidencia, id_archivo);


--
-- Name: incidencias_estados incidencias_estados_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.incidencias_estados
    ADD CONSTRAINT incidencias_estados_pkey PRIMARY KEY (id_pedidos_estados);


--
-- Name: incidencias incidencias_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.incidencias
    ADD CONSTRAINT incidencias_pkey PRIMARY KEY (id_incidencia);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: usuarios usuarios_usuario_key; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_usuario_key UNIQUE (usuario);


--
-- Name: articulos_archivos articulos_archivos_id_archivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.articulos_archivos
    ADD CONSTRAINT articulos_archivos_id_archivo_fkey FOREIGN KEY (id_archivo) REFERENCES public.archivos(id_archivo) ON DELETE CASCADE;


--
-- Name: articulos_archivos articulos_archivos_id_articulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.articulos_archivos
    ADD CONSTRAINT articulos_archivos_id_articulo_fkey FOREIGN KEY (id_articulo) REFERENCES public.articulos(id_articulo) ON DELETE CASCADE;


--
-- Name: incidencias_archivos incidencias_archivos_id_archivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.incidencias_archivos
    ADD CONSTRAINT incidencias_archivos_id_archivo_fkey FOREIGN KEY (id_archivo) REFERENCES public.archivos(id_archivo) ON DELETE CASCADE;


--
-- Name: incidencias_archivos incidencias_archivos_id_incidencia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.incidencias_archivos
    ADD CONSTRAINT incidencias_archivos_id_incidencia_fkey FOREIGN KEY (id_incidencia) REFERENCES public.incidencias(id_incidencia) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict XedFV9qcaEaKVj8yloKMRPFX8VP0j2YRhg1Taaz26qy5viVkcBdp8amavrPvfye

