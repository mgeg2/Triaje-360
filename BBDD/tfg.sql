-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-05-2026 a las 07:33:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tfg`
--
CREATE DATABASE IF NOT EXISTS `tfg` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `tfg`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acciones`
--

CREATE TABLE `acciones` (
  `id` varchar(250) NOT NULL,
  `nombre_accion` varchar(250) NOT NULL,
  `tiempo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `acciones`
--

INSERT INTO `acciones` (`id`, `nombre_accion`, `tiempo`) VALUES
('1', 'Drenaje Torácico', 60),
('2', 'compresion sangrado', 60),
('3', 'collarin cervical', 60),
('4', 'guedel', 10),
('5', 'pls', 30);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acciones_intento`
--

CREATE TABLE `acciones_intento` (
  `id` int(11) NOT NULL,
  `intento_id` varchar(250) NOT NULL,
  `paciente_id` varchar(250) NOT NULL,
  `accion_id` varchar(250) DEFAULT NULL,
  `color_asignado` varchar(250) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `acciones_intento`
--

INSERT INTO `acciones_intento` (`id`, `intento_id`, `paciente_id`, `accion_id`, `color_asignado`, `created_at`) VALUES
(19, '2l74b1cbdb970k09ilc7', '2l748jbn8kb40pj2gafs', NULL, 'verde', '2026-04-20 09:59:08'),
(20, '2l74bd4rkqe1or3nqg7p', '2l748jbn8kb40pj2gafs', NULL, 'verde', '2026-04-20 10:04:25'),
(21, '2l74c1orc1cbia0tdbfl', '2l74brtghs2fmbq1n683', NULL, 'verde', '2026-04-20 10:12:49'),
(22, '2l74c1orc1cbia0tdbfl', '2l74brtm24n0bnkqarp3h', NULL, 'verde', '2026-04-20 10:12:49'),
(23, '2l7benesehd30n1rgtc7', '2l74brtghs2fmbq1n683', NULL, 'amarillo', '2026-04-22 10:04:34'),
(24, '2l7benesehd30n1rgtc7', '2l74brtm24n0bnkqarp3h', NULL, 'verde', '2026-04-22 10:04:34'),
(25, '2l7bfs7etic59sme3n1d', '2l74brtrtsc0jgtktm5c', NULL, 'verde', '2026-04-22 10:20:12'),
(26, '2l7ie8dbs17ctdq9etp4l', '2l74brqp5gc15s5mkna5', NULL, 'rojo', '2026-04-24 09:12:48'),
(27, '2l7ie8dbs17ctdq9etp4l', '2l74brtrtsc0jgtktm5c', NULL, 'amarillo', '2026-04-24 09:12:48'),
(28, '2l9emrjlted90mk5aei1', '2l74brtrtsc0jgtktm5c', NULL, 'verde', '2026-05-10 05:09:26'),
(29, '2l9enn6n8e298nc2anaa', '2l74brtghs2fmbq1n683', NULL, 'verde', '2026-05-10 05:20:57'),
(30, '2l9enn6n8e298nc2anaa', '2l74brtm24n0bnkqarp3h', NULL, 'verde', '2026-05-10 05:20:57'),
(31, '2l9ennri7s9jsep57hjb', '2l74brtrtsc0jgtktm5c', NULL, 'verde', '2026-05-10 05:21:15'),
(32, '2l9epj6gfo2hmh7tjkdn', '2l74brtrtsc0jgtktm5c', NULL, 'verde', '2026-05-10 05:46:08'),
(33, '2l9epr4dqngjc8e78d3d', '2l74bnstkrhlaamjhj13', NULL, 'verde', '2026-05-10 05:49:43'),
(34, '2l9epr4dqngjc8e78d3d', '2l74bnt57stsga3p9enf', NULL, 'rojo', '2026-05-10 05:49:43'),
(35, '2l9epr4dqngjc8e78d3d', '2l74bntanc657f74c7f5', NULL, 'amarillo', '2026-05-10 05:49:43'),
(36, '2l9epr4dqngjc8e78d3d', '2l74bntanc657f74c7f5', '1', NULL, '2026-05-10 05:49:43'),
(37, '2l9epr4dqngjc8e78d3d', '2l74bntanc657f74c7f5', '5', NULL, '2026-05-10 05:49:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acciones_paciente`
--

CREATE TABLE `acciones_paciente` (
  `paciente_id` varchar(250) NOT NULL,
  `acciones_id` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `acciones_paciente`
--

INSERT INTO `acciones_paciente` (`paciente_id`, `acciones_id`) VALUES
('2l6nk419kanm9hjaan0p', '2'),
('2l6nk419kanm9hjaan0p', '3'),
('2l6nl3jkne26kebir4il', '2'),
('2l6nk24s1cjfg4e54bfs', '3');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `acciones_paciente_ejercicio`
--

CREATE TABLE `acciones_paciente_ejercicio` (
  `id` int(11) NOT NULL,
  `paciente_id` varchar(250) NOT NULL,
  `acciones_id` varchar(250) NOT NULL,
  `ejercicio_id` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `acciones_paciente_ejercicio`
--

INSERT INTO `acciones_paciente_ejercicio` (`id`, `paciente_id`, `acciones_id`, `ejercicio_id`) VALUES
(96, '2l74brtghs2fmbq1n683', '3', '2l74brkhs1br3qk1ameji'),
(97, '2l74brtm24n0bnkqarp3h', '3', '2l74brkhs1br3qk1ameji'),
(98, '2l74brtrtsc0jgtktm5c', '3', '2l74brkhs1br3qk1ameji');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignatura`
--

CREATE TABLE `asignatura` (
  `id` varchar(250) NOT NULL,
  `codigo` int(11) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `curso` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignatura`
--

INSERT INTO `asignatura` (`id`, `codigo`, `nombre`, `curso`) VALUES
('2kjp366a8h24hm4qmnmk', 21019, 'Estructuracion de Contenidos', '24/25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejercicios`
--

CREATE TABLE `ejercicios` (
  `id` varchar(250) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date NOT NULL,
  `numerointentos` int(11) NOT NULL,
  `asignatura` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ejercicios`
--

INSERT INTO `ejercicios` (`id`, `nombre`, `descripcion`, `fechaInicio`, `fechaFin`, `numerointentos`, `asignatura`) VALUES
('2l74bnk91h127t3k0ie7', 'prueba con 1 escenario', 'prueba con un escenario para el miercoles', '2026-04-13', '2026-04-20', 0, '2kjp366a8h24hm4qmnmk'),
('2l74brkhs1br3qk1ameji', 'prueba con 2 escenarios', 'prueba con dos escenarios', '2026-04-21', '2026-04-28', 0, '2kjp366a8h24hm4qmnmk');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes`
--

CREATE TABLE `imagenes` (
  `id` varchar(250) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `tipo` varchar(250) NOT NULL,
  `fecha_subida` datetime NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imagenes`
--

INSERT INTO `imagenes` (`id`, `nombre_original`, `nombre_archivo`, `tipo`, `fecha_subida`, `descripcion`, `created_at`) VALUES
('2l6ngo9phnjn6009gd92', 'corte_cabeza.png', '2l6ngo9pf7h62bpj805m.png', 'paciente', '2026-04-17 11:01:56', NULL, '2026-04-17 09:01:56'),
('2l6nh7i10el7qlel9t6b', 'embarazada_.png', '2l6nh7i0tpdei83i7mga.png', 'paciente', '2026-04-17 11:07:55', NULL, '2026-04-17 09:07:55'),
('2l6nh8fni83stinbmj53', 'ElmodeloREAL_principal-1.png', '2l6nh8fngejekd1j9in1.png', 'paciente', '2026-04-17 11:08:20', NULL, '2026-04-17 09:08:20'),
('2l6nhhilc1r1tcostai76', 'paciente6.png', '2l6nhhilain9tgh7bihb.png', 'paciente', '2026-04-17 11:12:25', NULL, '2026-04-17 09:12:25'),
('2l74blchlo33gtrnja2t', 'R360-1.JPG', '2l74blchlk0h5ch1k176.JPG', 'escenario', '2026-04-20 12:08:08', NULL, '2026-04-20 10:08:08'),
('2l74blqg72d3nh4423758', 'R360-2.JPG', '2l74blqg7jk8t6m9jdnr.JPG', 'escenario', '2026-04-20 12:08:20', NULL, '2026-04-20 10:08:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_ejercicio`
--

CREATE TABLE `imagenes_ejercicio` (
  `imagen` varchar(250) NOT NULL,
  `ejercicio` varchar(250) NOT NULL,
  `orden` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imagenes_ejercicio`
--

INSERT INTO `imagenes_ejercicio` (`imagen`, `ejercicio`, `orden`) VALUES
('2l74blchlo33gtrnja2t', '2l74bnk91h127t3k0ie7', 1),
('2l74blchlo33gtrnja2t', '2l74brkhs1br3qk1ameji', 1),
('2l74blqg72d3nh4423758', '2l74brkhs1br3qk1ameji', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `intentos_ejercicio`
--

CREATE TABLE `intentos_ejercicio` (
  `id` varchar(250) NOT NULL,
  `usuario_id` varchar(250) NOT NULL,
  `ejercicio_id` varchar(250) NOT NULL,
  `tiempo_realizado` int(11) NOT NULL COMMENT 'Tiempo en segundos',
  `fecha_inicio` datetime NOT NULL,
  `fecha_finalizacion` datetime NOT NULL,
  `numero_intento` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `intentos_ejercicio`
--

INSERT INTO `intentos_ejercicio` (`id`, `usuario_id`, `ejercicio_id`, `tiempo_realizado`, `fecha_inicio`, `fecha_finalizacion`, `numero_intento`, `created_at`) VALUES
('2l6nqrbspaos1064hm56', '2kqoqg64o005247d974bg48', '2l6npdi985ibbi50d5k5', 5, '2026-04-17 13:18:14', '2026-04-17 13:18:19', 1, '2026-04-17 11:18:19'),
('2l6nr28a5c077s7e7kt1', '2kqoqg64o005247d974bg48', '2l6npdi985ibbi50d5k5', 121, '2026-04-17 13:18:30', '2026-04-17 13:20:31', 2, '2026-04-17 11:20:31'),
('2l6nr698imp0ef4a0k8h', '2kqoqg64o005247d974bg48', '2l6npdi985ibbi50d5k5', 100, '2026-04-17 13:20:40', '2026-04-17 13:22:20', 3, '2026-04-17 11:22:20'),
('2l748mfm0tb8picnm4j9', '2kqoqg64o005247d974bg48', '2l747bimef8iegifrqom', 27, '2026-04-20 11:27:41', '2026-04-20 11:28:08', 1, '2026-04-20 09:28:08'),
('2l748ohlc1qoqajd11888', '2kqoqg64o005247d974bg48', '2l747bimef8iegifrqom', 21, '2026-04-20 11:28:42', '2026-04-20 11:29:03', 2, '2026-04-20 09:29:03'),
('2l749453jb02gs38mflt', '2kqoqg64o005247d974bg48', '2l747bimef8iegifrqom', 103, '2026-04-20 11:31:39', '2026-04-20 11:33:22', 3, '2026-04-20 09:33:22'),
('2l74a6mq742tl84l0tjtg', '2kqoqg64o005247d974bg48', '2l748j2sthd1rne6g5st', 150, '2026-04-20 11:45:32', '2026-04-20 11:48:02', 1, '2026-04-20 09:48:02'),
('2l74a7nce168gb7cp44c2', '2kqoqg64o005247d974bg48', '2l748j2sthd1rne6g5st', 18, '2026-04-20 11:48:12', '2026-04-20 11:48:30', 2, '2026-04-20 09:48:30'),
('2l74afopsgc09n56h62c', '2kqoqg64o005247d974bg48', '2l748j2sthd1rne6g5st', 52, '2026-04-20 11:51:15', '2026-04-20 11:52:07', 3, '2026-04-20 09:52:07'),
('2l74al5anitem812ljpr', '2kqoqg64o005247d974bg48', '2l747bimef8iegifrqom', 6, '2026-04-20 11:54:25', '2026-04-20 11:54:31', 4, '2026-04-20 09:54:31'),
('2l74b05e8erlcg7jl925', '2kqoqg64o005247d974bg48', '2l748j2sthd1rne6g5st', 135, '2026-04-20 11:56:19', '2026-04-20 11:58:34', 4, '2026-04-20 09:58:34'),
('2l74b1cbdb970k09ilc7', '2kqoqg64o005247d974bg48', '2l748j2sthd1rne6g5st', 20, '2026-04-20 11:58:48', '2026-04-20 11:59:08', 5, '2026-04-20 09:59:08'),
('2l74bd4rkqe1or3nqg7p', '2kqoqg64o005247d974bg48', '2l748j2sthd1rne6g5st', 56, '2026-04-20 12:03:29', '2026-04-20 12:04:25', 6, '2026-04-20 10:04:25'),
('2l74c1orc1cbia0tdbfl', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 54, '2026-04-20 12:11:55', '2026-04-20 12:12:49', 1, '2026-04-20 10:12:49'),
('2l7benesehd30n1rgtc7', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 1064, '2026-04-22 11:46:50', '2026-04-22 12:04:34', 2, '2026-04-22 10:04:34'),
('2l7bfs7etic59sme3n1d', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 12, '2026-04-22 12:20:00', '2026-04-22 12:20:12', 3, '2026-04-22 10:20:12'),
('2l7bg00q21arapg56b474', '2kqoqg64o005247d974bg48', '2l74bnk91h127t3k0ie7', 3, '2026-04-22 12:20:57', '2026-04-22 12:21:00', 1, '2026-04-22 10:21:00'),
('2l7ie8dbs17ctdq9etp4l', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 53, '2026-04-24 11:11:55', '2026-04-24 11:12:48', 4, '2026-04-24 09:12:48'),
('2l82m32ns6g8c6rk2f5lk', '2kqoqg64o005247d974bg48', '2l74bnk91h127t3k0ie7', 31, '2026-04-28 11:27:52', '2026-04-28 11:28:23', 2, '2026-04-28 09:28:23'),
('2l9els5gle4g78repf1m', '2kqoqg64o005247d974bg48', '2l74bnk91h127t3k0ie7', 4, '2026-05-10 06:56:07', '2026-05-10 06:56:11', 3, '2026-05-10 04:56:11'),
('2l9empobefs66cb2818i', '2kqoqg64o005247d974bg48', '2l74bnk91h127t3k0ie7', 19, '2026-05-10 07:08:17', '2026-05-10 07:08:36', 4, '2026-05-10 05:08:36'),
('2l9emrjlted90mk5aei1', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 47, '2026-05-10 07:08:39', '2026-05-10 07:09:26', 5, '2026-05-10 05:09:26'),
('2l9enll2g63iqctierqbe', '2kqoqg64o005247d974bg48', '2l74bnk91h127t3k0ie7', 4, '2026-05-10 07:20:11', '2026-05-10 07:20:15', 5, '2026-05-10 05:20:15'),
('2l9enn6n8e298nc2anaa', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 39, '2026-05-10 07:20:18', '2026-05-10 07:20:57', 6, '2026-05-10 05:20:57'),
('2l9ennri7s9jsep57hjb', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 14, '2026-05-10 07:21:01', '2026-05-10 07:21:15', 7, '2026-05-10 05:21:15'),
('2l9epj6gfo2hmh7tjkdn', '2kqoqg64o005247d974bg48', '2l74brkhs1br3qk1ameji', 14, '2026-05-10 07:45:54', '2026-05-10 07:46:08', 8, '2026-05-10 05:46:08'),
('2l9eplhri6i7sa09gdnh', '2kqoqg64o005247d974bg48', '2l74bnk91h127t3k0ie7', 62, '2026-05-10 07:46:11', '2026-05-10 07:47:13', 6, '2026-05-10 05:47:13'),
('2l9epr4dqngjc8e78d3d', '2kqoqg64o005247d974bg48', '2l74bnk91h127t3k0ie7', 137, '2026-05-10 07:47:26', '2026-05-10 07:49:43', 7, '2026-05-10 05:49:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id` varchar(250) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `color` varchar(250) NOT NULL,
  `Tempeora` int(11) NOT NULL,
  `imagen` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id`, `nombre`, `descripcion`, `color`, `Tempeora`, `imagen`) VALUES
('2l6nja5ipifce7ds3mt6', 'paciente brecha', 'paciente con brecha en cabeza', 'verde', 0, '2l6nhhilc1r1tcostai76'),
('2l6nk24s1cjfg4e54bfs', 'paciente embarazada', 'paciente embarazada con contusion en la barriga', 'amarillo', 0, '2l6nh7i10el7qlel9t6b'),
('2l6nk419kanm9hjaan0p', 'paciente aplastado', 'paciente con  aplastamiento de miembro inferior derecho', 'rojo', 0, '2l6nh8fni83stinbmj53'),
('2l6nl3jkne26kebir4il', 'paciente contusion', 'paciente con contusion en la cabeza', 'rojo', 0, '2l6ngo9phnjn6009gd92');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes_ejercicio`
--

CREATE TABLE `pacientes_ejercicio` (
  `id` varchar(250) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `color` varchar(250) NOT NULL,
  `Tempeora` int(11) NOT NULL,
  `imagen` varchar(250) NOT NULL,
  `ejercicio` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes_ejercicio`
--

INSERT INTO `pacientes_ejercicio` (`id`, `nombre`, `descripcion`, `color`, `Tempeora`, `imagen`, `ejercicio`) VALUES
('2l74bnstkrhlaamjhj13', 'paciente brecha', 'paciente con brecha en cabeza', 'verde', 0, '2l6nhhilc1r1tcostai76', '2l74bnk91h127t3k0ie7'),
('2l74bnt57stsga3p9enf', 'paciente brecha', 'paciente con brecha en cabeza', 'verde', 0, '2l6nhhilc1r1tcostai76', '2l74bnk91h127t3k0ie7'),
('2l74bntanc657f74c7f5', 'paciente brecha', 'paciente con brecha en cabeza', 'verde', 0, '2l6nhhilc1r1tcostai76', '2l74bnk91h127t3k0ie7'),
('2l74brqjs28t078g8lso5', 'paciente brecha', 'paciente con brecha en cabeza', 'verde', 0, '2l6nhhilc1r1tcostai76', '2l74brkhs1br3qk1ameji'),
('2l74brqp5gc15s5mkna5', 'paciente brecha', 'paciente con brecha en cabeza', 'verde', 0, '2l6nhhilc1r1tcostai76', '2l74brkhs1br3qk1ameji'),
('2l74brr1hdf2jkn5k8ns', 'paciente brecha', 'paciente con brecha en cabeza', 'verde', 0, '2l6nhhilc1r1tcostai76', '2l74brkhs1br3qk1ameji'),
('2l74brtghs2fmbq1n683', 'paciente embarazada', 'paciente embarazada con contusion en la barriga', 'amarillo', 0, '2l6nh7i10el7qlel9t6b', '2l74brkhs1br3qk1ameji'),
('2l74brtm24n0bnkqarp3h', 'paciente embarazada', 'paciente embarazada con contusion en la barriga', 'amarillo', 0, '2l6nh7i10el7qlel9t6b', '2l74brkhs1br3qk1ameji'),
('2l74brtrtsc0jgtktm5c', 'paciente embarazada', 'paciente embarazada con contusion en la barriga', 'amarillo', 0, '2l6nh7i10el7qlel9t6b', '2l74brkhs1br3qk1ameji');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sonidos`
--

CREATE TABLE `sonidos` (
  `id` varchar(250) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `fecha_subida` datetime NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sonidos`
--

INSERT INTO `sonidos` (`id`, `nombre_original`, `nombre_archivo`, `fecha_subida`, `descripcion`, `created_at`) VALUES
('2ktnngkedm45g71tjkbf', 'freesound_community-crowd-shouting-6325.mp3', '2ktnngked72g4dollodd', '2026-02-17 10:03:00', NULL, '2026-02-17 09:03:00'),
('2ktnnh1ps5pi3cs4slgk', '462410__luchito_9717__ambulance.wav', '2ktnnh1psj9j3gqnipn7', '2026-02-17 10:03:10', NULL, '2026-02-17 09:03:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sonidos_ejercicio`
--

CREATE TABLE `sonidos_ejercicio` (
  `id` int(11) NOT NULL,
  `sonido_id` varchar(250) NOT NULL,
  `ejercicio_id` varchar(250) NOT NULL,
  `posicion` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sonidos_ejercicio`
--

INSERT INTO `sonidos_ejercicio` (`id`, `sonido_id`, `ejercicio_id`, `posicion`, `created_at`) VALUES
(1, '2ktnnh1ps5pi3cs4slgk', '2ktnnp91s1tennm2toaon', 1, '2026-02-17 09:11:35'),
(2, '2ktnnfoh971gof340if', '2ktnnp91s1tennm2toaon', 2, '2026-02-17 09:11:35'),
(3, '2ktnng99tjhkrinor0ij', '2ktnnp91s1tennm2toaon', 3, '2026-02-17 09:11:35'),
(4, '2ktnngkedm45g71tjkbf', '2ktnnp91s1tennm2toaon', 4, '2026-02-17 09:11:35'),
(5, '2ktnnh1ps5pi3cs4slgk', '2ktnocle3n5likaqo1e2', 1, '2026-02-17 09:14:49'),
(6, '2ktnngkedm45g71tjkbf', '2ktnocle3n5likaqo1e2', 2, '2026-02-17 09:14:49'),
(7, '2ktnnfoh971gof340if', '2ktnocle3n5likaqo1e2', 3, '2026-02-17 09:14:49'),
(8, '2ktnng99tjhkrinor0ij', '2ktnocle3n5likaqo1e2', 4, '2026-02-17 09:14:49'),
(13, '2ktnnh1ps5pi3cs4slgk', '2l0fd68rd3aeel4nfqdfn', 1, '2026-02-23 11:13:27'),
(14, '2ktnngkedm45g71tjkbf', '2l0fd68rd3aeel4nfqdfn', 2, '2026-02-23 11:13:27'),
(18, '2ktnngkedm45g71tjkbf', '2l0qflts3d1ra1cs0kb4', 1, '2026-02-26 14:03:07'),
(19, '2ktnng99tjhkrinor0ij', '2l0qflts3d1ra1cs0kb4', 2, '2026-02-26 14:03:07'),
(20, '2ktnnh1ps5pi3cs4slgk', '2l0qflts3d1ra1cs0kb4', 3, '2026-02-26 14:03:07'),
(21, '2ktnnh1ps5pi3cs4slgk', '2ktnodpn3ka1i748idfp', 1, '2026-02-26 14:10:28'),
(22, '2ktnng99tjhkrinor0ij', '2ktnodpn3ka1i748idfp', 2, '2026-02-26 14:10:28'),
(23, '2ktnngkedm45g71tjkbf', '2ktnodpn3ka1i748idfp', 3, '2026-02-26 14:10:28'),
(24, '2ktnngkedm45g71tjkbf', '2l6nl4bi4ak2pbkcmkfl', 1, '2026-04-17 10:00:37'),
(25, '2ktnng99tjhkrinor0ij', '2l6nl8m15sse8h6p83t9', 1, '2026-04-17 10:02:29'),
(26, '2ktnngkedm45g71tjkbf', '2l6nl9f26fk3l08pne7e', 1, '2026-04-17 10:02:52'),
(27, '2ktnngkedm45g71tjkbf', '2l6nlhfbpkca8i7qh0ca', 1, '2026-04-17 10:06:26'),
(28, '2ktnngkedm45g71tjkbf', '2l6noeg3jtdfm7cs5ofl', 1, '2026-04-17 10:45:36'),
(29, '2ktnngkedm45g71tjkbf', '2l6nogpctt6btc1qnt77', 1, '2026-04-17 10:46:37'),
(30, '2ktnnh1ps5pi3cs4slgk', '2l6nok4ar44s51psoi20j', 1, '2026-04-17 10:48:08'),
(39, '2ktnngkedm45g71tjkbf', '2l6npdi985ibbi50d5k5', 1, '2026-04-17 11:17:29'),
(47, '2ktnng99tjhkrinor0ij', '2l6nr76jilec3dgnjhp6', 1, '2026-04-17 11:32:58'),
(48, '2ktnngkedm45g71tjkbf', '2l74719odmdpi0c12m5g', 1, '2026-04-20 09:05:10'),
(49, '2ktnngkedm45g71tjkbf', '2l7472ms1ee8s1qh5c8k', 1, '2026-04-20 09:05:49'),
(51, '2ktnngkedm45g71tjkbf', '2l747d1jqc9529skaffh', 1, '2026-04-20 09:10:25'),
(52, '2ktnngkedm45g71tjkbf', '2l747bimef8iegifrqom', 1, '2026-04-20 09:13:36'),
(53, '2ktnngkedm45g71tjkbf', '2l747la53pbgqaheq4cm', 1, '2026-04-20 09:14:09'),
(54, '2ktnnh1ps5pi3cs4slgk', '2l7483j1cm0787b1i6b4', 1, '2026-04-20 09:19:42'),
(55, '2ktnng99tjhkrinor0ij', '2l7486gfmbpf48j7gdqb', 1, '2026-04-20 09:21:00'),
(60, '2ktnnh1ps5pi3cs4slgk', '2l748j2sthd1rne6g5st', 1, '2026-04-20 10:02:40'),
(66, '2ktnngkedm45g71tjkbf', '2l7eodb329222o7tq8h6', 1, '2026-04-23 08:30:04'),
(67, '2ktnnh1ps5pi3cs4slgk', '2l7eohnkd198747m27f0o', 1, '2026-04-23 08:32:39'),
(68, '2ktnngkedm45g71tjkbf', '2l7eti2q8hj7jh5p64qc', 1, '2026-04-23 09:40:09'),
(71, '2ktnngkedm45g71tjkbf', '2l74bnk91h127t3k0ie7', 1, '2026-04-23 10:05:25'),
(72, '2ktnngkedm45g71tjkbf', '2l7f1j93r0966pld425bc', 1, '2026-04-23 10:07:56'),
(73, '2ktnnh1ps5pi3cs4slgk', '2l91tjjr8j83qt5l5ebq', 1, '2026-05-06 14:55:24'),
(74, '2ktnnh1ps5pi3cs4slgk', '2l922go6kmb9m6r8emji', 1, '2026-05-06 15:34:37'),
(75, '2ktnngkedm45g71tjkbf', '2l922p3lr2h1sie4onnoo', 1, '2026-05-06 15:38:22'),
(76, '2ktnnh1ps5pi3cs4slgk', '2l927af674d29eho37j8', 1, '2026-05-06 16:39:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicacion_pacientes_ejercicio`
--

CREATE TABLE `ubicacion_pacientes_ejercicio` (
  `paciente` varchar(250) NOT NULL,
  `ejercicio` varchar(250) NOT NULL,
  `imagen` varchar(250) NOT NULL,
  `fila` int(11) NOT NULL,
  `columna` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicacion_pacientes_ejercicio`
--

INSERT INTO `ubicacion_pacientes_ejercicio` (`paciente`, `ejercicio`, `imagen`, `fila`, `columna`) VALUES
('2l74bnstkrhlaamjhj13', '2l74bnk91h127t3k0ie7', '2l74blchlk0h5ch1k176.JPG', 4, 2),
('2l74bnt57stsga3p9enf', '2l74bnk91h127t3k0ie7', '2l74blchlk0h5ch1k176.JPG', 3, 11),
('2l74bntanc657f74c7f5', '2l74bnk91h127t3k0ie7', '2l74blchlk0h5ch1k176.JPG', 3, 9),
('2l74brqjs28t078g8lso5', '2l74brkhs1br3qk1ameji', '2l74blchlk0h5ch1k176.JPG', 3, 16),
('2l74brqp5gc15s5mkna5', '2l74brkhs1br3qk1ameji', '2l74blchlk0h5ch1k176.JPG', 3, 2),
('2l74brr1hdf2jkn5k8ns', '2l74brkhs1br3qk1ameji', '2l74blqg7jk8t6m9jdnr.JPG', 2, 13),
('2l74brtghs2fmbq1n683', '2l74brkhs1br3qk1ameji', '2l74blqg7jk8t6m9jdnr.JPG', 4, 14),
('2l74brtm24n0bnkqarp3h', '2l74brkhs1br3qk1ameji', '2l74blqg7jk8t6m9jdnr.JPG', 2, 4),
('2l74brtrtsc0jgtktm5c', '2l74brkhs1br3qk1ameji', '2l74blchlk0h5ch1k176.JPG', 3, 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `nickname` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL,
  `role` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `nickname`, `password`, `role`) VALUES
('2kbcrjder9ce2l9d1i5j', 'admin@gmail.com', 'admin', '$2b$10$VhrTjmZWbrRBCPJvzSWuFOjzF6mYL1khfhWtPdWrOKMn0loYenU22', 'admin'),
('2kd9b6jig8531sh2lkea', 'user@gmail.com', 'userprueba', '$2b$10$wXFChU0vVMMLaVxbZ4xcE.ic6FYkfBERfoJ/L/Hrh/7h/ldDUz0Ly', 'alu'),
('2kdgltkglof16td6ctle', 'prof@gmail.com', 'prof', '$2b$10$TsTqXJ8.gpraYp4WRiUa2OLmiu8FZrOzG53cQZMbLGkjKa4kyaW2.', 'prof'),
('2kgis284nrj1cn44t1oq', 'user2@gmail.com', 'user2', '$2b$10$p/y/GFBGuZyUs13I4HQdn.4liWJWVVzh2JAs8/SDjHsWFscPVjh9K', 'alu'),
('2kgis4j0kp5nobfp8dhs', 'prof2@gmail.com', 'prof2', '$2b$10$jztbeOAgIub4rbxQmJCgQ.MlusW8premqaxFBPox3F9oYLZ3iyeV6', 'prof'),
('2kjp343f38on5ig47301', 'prof3@gmail.com', 'prof3', '$2b$10$Zwd/zbp0omxhfdZ83YBmrOV1DrJkGilT2elnVbKRvCsiaBfrJk39.', 'prof'),
('2kqoqg64o005247d974bg48', 'usu3@gmail.com', 'usu3', '$2b$10$rTRonw3kSkfr./FFflhEVu2hRG8Jzb2wnQ6c2snX62d2K0qpHItwm', 'alu');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_asignatura`
--

CREATE TABLE `user_asignatura` (
  `usuario` varchar(250) NOT NULL,
  `asignatura` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user_asignatura`
--

INSERT INTO `user_asignatura` (`usuario`, `asignatura`) VALUES
('2kjp343f38on5ig47301', '2kjp366a8h24hm4qmnmk'),
('2kqoqg64o005247d974bg48', '2kjp366a8h24hm4qmnmk');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `acciones`
--
ALTER TABLE `acciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `acciones_intento`
--
ALTER TABLE `acciones_intento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intento_id` (`intento_id`),
  ADD KEY `paciente_id` (`paciente_id`),
  ADD KEY `accion_id` (`accion_id`);

--
-- Indices de la tabla `acciones_paciente`
--
ALTER TABLE `acciones_paciente`
  ADD KEY `accion` (`acciones_id`),
  ADD KEY `paciente` (`paciente_id`);

--
-- Indices de la tabla `acciones_paciente_ejercicio`
--
ALTER TABLE `acciones_paciente_ejercicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `accion` (`acciones_id`),
  ADD KEY `pacient` (`paciente_id`);

--
-- Indices de la tabla `asignatura`
--
ALTER TABLE `asignatura`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asig` (`asignatura`);

--
-- Indices de la tabla `imagenes`
--
ALTER TABLE `imagenes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_archivo` (`nombre_archivo`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_fecha` (`fecha_subida`);

--
-- Indices de la tabla `imagenes_ejercicio`
--
ALTER TABLE `imagenes_ejercicio`
  ADD PRIMARY KEY (`ejercicio`,`orden`),
  ADD KEY `imagen` (`imagen`);

--
-- Indices de la tabla `intentos_ejercicio`
--
ALTER TABLE `intentos_ejercicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `ejercicio_id` (`ejercicio_id`),
  ADD KEY `idx_usuario_ejercicio` (`usuario_id`,`ejercicio_id`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `imagen_paciente` (`imagen`);

--
-- Indices de la tabla `pacientes_ejercicio`
--
ALTER TABLE `pacientes_ejercicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `imagen_paciente` (`imagen`),
  ADD KEY `esta en el ejercicio` (`ejercicio`);

--
-- Indices de la tabla `sonidos`
--
ALTER TABLE `sonidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_archivo` (`nombre_archivo`),
  ADD KEY `idx_fecha` (`fecha_subida`);

--
-- Indices de la tabla `sonidos_ejercicio`
--
ALTER TABLE `sonidos_ejercicio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_sonido_ejercicio` (`sonido_id`,`ejercicio_id`),
  ADD KEY `ejercicio_id` (`ejercicio_id`),
  ADD KEY `sonido_id` (`sonido_id`);

--
-- Indices de la tabla `ubicacion_pacientes_ejercicio`
--
ALTER TABLE `ubicacion_pacientes_ejercicio`
  ADD PRIMARY KEY (`paciente`,`ejercicio`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `user_asignatura`
--
ALTER TABLE `user_asignatura`
  ADD KEY `asignatura` (`asignatura`),
  ADD KEY `usuario` (`usuario`) USING BTREE;

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `acciones_intento`
--
ALTER TABLE `acciones_intento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `acciones_paciente_ejercicio`
--
ALTER TABLE `acciones_paciente_ejercicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT de la tabla `sonidos_ejercicio`
--
ALTER TABLE `sonidos_ejercicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `acciones_intento`
--
ALTER TABLE `acciones_intento`
  ADD CONSTRAINT `fk_accion_acciones` FOREIGN KEY (`accion_id`) REFERENCES `acciones` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_intento_acciones` FOREIGN KEY (`intento_id`) REFERENCES `intentos_ejercicio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_paciente_acciones` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes_ejercicio` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `acciones_paciente`
--
ALTER TABLE `acciones_paciente`
  ADD CONSTRAINT `accion` FOREIGN KEY (`acciones_id`) REFERENCES `acciones` (`id`),
  ADD CONSTRAINT `paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`);

--
-- Filtros para la tabla `acciones_paciente_ejercicio`
--
ALTER TABLE `acciones_paciente_ejercicio`
  ADD CONSTRAINT `action` FOREIGN KEY (`acciones_id`) REFERENCES `acciones` (`id`),
  ADD CONSTRAINT `pacient` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes_ejercicio` (`id`);

--
-- Filtros para la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  ADD CONSTRAINT `asig` FOREIGN KEY (`asignatura`) REFERENCES `asignatura` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `imagenes_ejercicio`
--
ALTER TABLE `imagenes_ejercicio`
  ADD CONSTRAINT `ejercicio` FOREIGN KEY (`ejercicio`) REFERENCES `ejercicios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `imagen` FOREIGN KEY (`imagen`) REFERENCES `imagenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `intentos_ejercicio`
--
ALTER TABLE `intentos_ejercicio`
  ADD CONSTRAINT `fk_ejercicio_intentos` FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usuario_intentos` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `imagen_paciente` FOREIGN KEY (`imagen`) REFERENCES `imagenes` (`id`);

--
-- Filtros para la tabla `pacientes_ejercicio`
--
ALTER TABLE `pacientes_ejercicio`
  ADD CONSTRAINT `esta en el ejercicio` FOREIGN KEY (`ejercicio`) REFERENCES `ejercicios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `imagenes_paciente` FOREIGN KEY (`imagen`) REFERENCES `imagenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `user_asignatura`
--
ALTER TABLE `user_asignatura`
  ADD CONSTRAINT `alumno` FOREIGN KEY (`usuario`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `asignatura` FOREIGN KEY (`asignatura`) REFERENCES `asignatura` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
