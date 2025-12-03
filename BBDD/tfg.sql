-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 11:48:57
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
-- Estructura de tabla para la tabla `asignatura`
--

CREATE TABLE IF NOT EXISTS `asignatura` (
  `id` varchar(250) NOT NULL,
  `codigo` int(11) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `curso` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncar tablas antes de insertar `asignatura`
--

TRUNCATE TABLE `asignatura`;
--
-- Volcado de datos para la tabla `asignatura`
--

INSERT INTO `asignatura` (`id`, `codigo`, `nombre`, `curso`) VALUES
('2kd9fckc7t9tla26e1cj', 21008, 'ESTRUCTURA DE DATOS Y ALGORITMIA', '24/25'),
('2kjp366a8h24hm4qmnmk', 21019, 'Estructuracion de Contenidos', '24/25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejercicios`
--

CREATE TABLE IF NOT EXISTS `ejercicios` (
  `id` varchar(250) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date NOT NULL,
  `numerointentos` int(11) NOT NULL,
  `asignatura` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `asig` (`asignatura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncar tablas antes de insertar `ejercicios`
--

TRUNCATE TABLE `ejercicios`;
--
-- Volcado de datos para la tabla `ejercicios`
--

INSERT INTO `ejercicios` (`id`, `nombre`, `descripcion`, `fechaInicio`, `fechaFin`, `numerointentos`, `asignatura`) VALUES
('2kkgnpo88d98senc00j4', 'ntynty', 'ntntnt', '2025-12-16', '2025-12-19', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkabi295g4k3994g82b', 'tkreomr', 'frnen', '2025-12-18', '2025-12-24', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkae5t3254rrf0thgb', 'n tntb', 'vdghs ', '2025-12-09', '2025-12-18', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkai8ereoa69fm1jqm', 'thgrh', 'bggtgt', '2025-12-24', '2025-12-30', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkako5smha4q2g49q6', 'vthtcde', 'gcs cgyju', '2025-12-16', '2025-12-24', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkamgorgj3pep4tbs', 'hiuhiu', 'huigiu', '2025-12-17', '2025-12-26', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkao8d5p5g4br9j6nr', 'huigiu', 'giugiu', '2025-12-17', '2025-12-25', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkcj2a57jt3l8bf8ls', 'feringr', 'frnciuevner', '2025-12-02', '2025-12-02', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkcs1sjpde5176i23c', 'btgjibgrnith', 'vtbgrsig', '2025-12-18', '2025-12-19', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkd9h17qtelml18ade', 'rtbvegt', 'brt3', '2025-12-16', '2025-12-19', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkdm1768gmj7es2bcc', 'yter', 'bt5bteg', '2025-12-25', '2025-12-30', 0, '2kd9fckc7t9tla26e1cj'),
('2kkke1i7st1c795lp6h4', 'h5hj5y3', 'hnr5tn', '2025-12-25', '2025-12-30', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkg6j62ag2ofrnt1jb', 'nhiubniu', 'niubiubui', '2025-12-19', '2025-12-26', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkh26b26bspffp7btj', 'hiiub', 'vyuvyu', '2025-12-24', '2025-12-23', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkhdqorpigeni9fldq', 'nhnt', 'nhtmnyjm', '2025-12-24', '2025-12-30', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkibhot1glafkf5gjtl', 'yuyiu', 'gyugyu', '2025-12-16', '2025-12-11', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkirf7hdcr362oe3r2', 'ntnryj', 'nhyndyu', '2025-12-30', '2026-01-05', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkjd9jdgl3n539948', ',uky', 'gregstrgb', '2025-12-18', '2025-12-25', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkjegsgr6i3ci5o1dk', 'ml9oyju7mfrbg', 'ndvhy6ekn8i', '2025-12-24', '2025-12-24', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkjl0i5p08r2i9s1rf', 'hytrnjyu', 'grrbty', '2025-12-10', '2025-12-22', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkjo4gj07jtem9odqap', 'nionibui', 'nthnhny', '2025-12-10', '2025-12-16', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkjpfc6qqeh8k143kq', 'fverg', 'cfer', '2025-12-24', '2025-12-29', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkpi3elfs5khpclct9', 'buuygyu', 'hiuhyugyugvyu', '2025-12-09', '2025-12-24', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkq06ksttm33li58c6', 'jionibj', 'jerinbbgr f', '2025-12-09', '2025-12-22', 0, '2kd9fckc7t9tla26e1cj'),
('2kkkqbgfroqa2j5pdbi8', 'jifvnninersf i', 'nveindgjr', '2025-12-08', '2025-12-16', 0, '2kd9fckc7t9tla26e1cj');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes`
--

CREATE TABLE IF NOT EXISTS `imagenes` (
  `id` varchar(250) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `tipo` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncar tablas antes de insertar `imagenes`
--

TRUNCATE TABLE `imagenes`;
--
-- Volcado de datos para la tabla `imagenes`
--

INSERT INTO `imagenes` (`id`, `nombre`, `descripcion`, `tipo`) VALUES
('1', 'paciente1', 'paciente con corte en la clavicula', 'paciente'),
('2', 'paciente2', 'paciente sangrante con corte profundo en la clavicula', 'paciente'),
('3', 'paciente3', 'paciente con hematoma en la cabeza', 'paciente'),
('4', 'paciente4', 'paciente manchado de sangre', 'paciente'),
('5 ', 'escenario1', 'escenario1', 'escenario'),
('6', 'escenario2', 'escenario2', 'escenario'),
('7', 'escenario3', 'escenario3', 'escenario'),
('8', 'escenario4', 'escenario4', 'escenario');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes_ejercicio`
--

CREATE TABLE IF NOT EXISTS `imagenes_ejercicio` (
  `imagen` varchar(250) NOT NULL,
  `ejercicio` varchar(250) NOT NULL,
  `orden` int(11) NOT NULL,
  PRIMARY KEY (`ejercicio`,`orden`),
  KEY `imagen` (`imagen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncar tablas antes de insertar `imagenes_ejercicio`
--

TRUNCATE TABLE `imagenes_ejercicio`;
--
-- Volcado de datos para la tabla `imagenes_ejercicio`
--

INSERT INTO `imagenes_ejercicio` (`imagen`, `ejercicio`, `orden`) VALUES
('5 ', '2kkkq06ksttm33li58c6', 1),
('5 ', '2kkkqbgfroqa2j5pdbi8', 1),
('6', '2kkkq06ksttm33li58c6', 2),
('6', '2kkkqbgfroqa2j5pdbi8', 2),
('7', '2kkkqbgfroqa2j5pdbi8', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `nickname` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL,
  `role` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncar tablas antes de insertar `users`
--

TRUNCATE TABLE `users`;
--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `nickname`, `password`, `role`) VALUES
('2kbcrjder9ce2l9d1i5j', 'admin@gmail.com', 'admin', '$2b$10$VhrTjmZWbrRBCPJvzSWuFOjzF6mYL1khfhWtPdWrOKMn0loYenU22', 'admin'),
('2kd9b6jig8531sh2lkea', 'user@gmail.com', 'userprueba', '$2b$10$wXFChU0vVMMLaVxbZ4xcE.ic6FYkfBERfoJ/L/Hrh/7h/ldDUz0Ly', 'alu'),
('2kdgltkglof16td6ctle', 'prof@gmail.com', 'prof', '$2b$10$TsTqXJ8.gpraYp4WRiUa2OLmiu8FZrOzG53cQZMbLGkjKa4kyaW2.', 'prof'),
('2kgis284nrj1cn44t1oq', 'user2@gmail.com', 'user2', '$2b$10$p/y/GFBGuZyUs13I4HQdn.4liWJWVVzh2JAs8/SDjHsWFscPVjh9K', 'alu'),
('2kgis4j0kp5nobfp8dhs', 'prof2@gmail.com', 'prof2', '$2b$10$jztbeOAgIub4rbxQmJCgQ.MlusW8premqaxFBPox3F9oYLZ3iyeV6', 'prof'),
('2kjp343f38on5ig47301', 'prof3@gmail.com', 'prof3', '$2b$10$Zwd/zbp0omxhfdZ83YBmrOV1DrJkGilT2elnVbKRvCsiaBfrJk39.', 'prof');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_asignatura`
--

CREATE TABLE IF NOT EXISTS `user_asignatura` (
  `usuario` varchar(250) NOT NULL,
  `asignatura` varchar(250) NOT NULL,
  KEY `asignatura` (`asignatura`),
  KEY `usuario` (`usuario`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncar tablas antes de insertar `user_asignatura`
--

TRUNCATE TABLE `user_asignatura`;
--
-- Volcado de datos para la tabla `user_asignatura`
--

INSERT INTO `user_asignatura` (`usuario`, `asignatura`) VALUES
('2kd9b6jig8531sh2lkea', '2kd9fckc7t9tla26e1cj'),
('2kdgltkglof16td6ctle', '2kd9fckc7t9tla26e1cj'),
('2kjp343f38on5ig47301', '2kd9fckc7t9tla26e1cj'),
('2kjp343f38on5ig47301', '2kjp366a8h24hm4qmnmk');

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ejercicios`
--
ALTER TABLE `ejercicios`
  ADD CONSTRAINT `asig` FOREIGN KEY (`asignatura`) REFERENCES `asignatura` (`id`);

--
-- Filtros para la tabla `imagenes_ejercicio`
--
ALTER TABLE `imagenes_ejercicio`
  ADD CONSTRAINT `ejercicio` FOREIGN KEY (`ejercicio`) REFERENCES `ejercicios` (`id`),
  ADD CONSTRAINT `imagen` FOREIGN KEY (`imagen`) REFERENCES `imagenes` (`id`);

--
-- Filtros para la tabla `user_asignatura`
--
ALTER TABLE `user_asignatura`
  ADD CONSTRAINT `alumno` FOREIGN KEY (`usuario`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `asignatura` FOREIGN KEY (`asignatura`) REFERENCES `asignatura` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
