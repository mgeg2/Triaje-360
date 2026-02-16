-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-02-2026 a las 12:20:06
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
('2klasdqob647mok0kbqbc', '1');

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
('2kd9fckc7t9tla26e1cj', 21008, 'ESTRUCTURA DE DATOS Y ALGORITMIA', '24/25'),
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
('2kst61k5mq5alpbsk19j', 'ngbsn g', 'tjyytnsyt', '2026-02-19', '2026-02-18', 0, '2kd9fckc7t9tla26e1cj');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagenes`
--

CREATE TABLE `imagenes` (
  `id` varchar(250) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL UNIQUE,
  `tipo` varchar(250) NOT NULL,
  `fecha_subida` datetime NOT NULL,
  `descripcion` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_fecha` (`fecha_subida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `imagenes`
--

INSERT INTO `imagenes` (`id`, `nombre_original`, `nombre_archivo`, `tipo`, `fecha_subida`, `descripcion`) VALUES
('1', 'paciente1.png', 'paciente1', 'paciente', NOW(), 'paciente con corte en la clavicula'),
('2', 'paciente2.png', 'paciente2', 'paciente', NOW(), 'paciente sangrante con corte profundo en la clavicula'),
('3', 'paciente3.png', 'paciente3', 'paciente', NOW(), 'paciente con hematoma en la cabeza'),
('4', 'paciente4.png', 'paciente4', 'paciente', NOW(), 'paciente manchado de sangre'),
('5', 'escenario1.JPG', 'escenario1', 'escenario', NOW(), 'escenario1'),
('6', 'escenario2.JPG', 'escenario2', 'escenario', NOW(), 'escenario2'),
('7', 'escenario3.JPG', 'escenario3', 'escenario', NOW(), 'escenario3'),
('8', 'escenario4.JPG', 'escenario4', 'escenario', NOW(), 'escenario4');

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
('5 ', '2kst61k5mq5alpbsk19j', 1);

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
('2klas48lfbfolkgcm31h', 'niño ojo abra', 'niño con el ojo inflamado esta llorando', 'amarillo', 1, '3'),
('2klas48lfbfolkgcm31h9', 'niño ojo', 'niño con el ojo inflamado esta llorando', 'amarillo', 7, '3'),
('2klas48lfbfolkgcm31o', 'niño ojo', 'niño con el ojo inflamado esta llorando', 'amarillo', 7, '3'),
('2klas48lfbfolkgcm31oi', 'niño ojo', 'niño con el ojo inflamado esta llorando', 'amarillo', 7, '3'),
('2klas7gf058t9sfo5rr0', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1'),
('2klas7gf058t9sfo5rr0h', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1'),
('2klas7gf058t9sfo5rr0hh', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1'),
('2klas7gf058t9sfo5rr0j', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1'),
('2klasdqob647mok0kbqb', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4'),
('2klasdqob647mok0kbqbb', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4'),
('2klasdqob647mok0kbqbc', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4'),
('2klasdqob647mok0kbqbcj', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4'),
('2kst5t687hert5qrb', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2'),
('2kst5t687hert5qrb6', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2'),
('2kst5t687hert5qrb6d', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2'),
('2kst5t687hert5qrb6ds', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2');

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
('2kst61pj18mfa3638pih', 'niño ojo abra', 'niño con el ojo inflamado esta llorando', 'amarillo', 1, '3', '2kst61k5mq5alpbsk19j'),
('2kst61qs38p9dhch4nk', 'niño ojo abra', 'niño con el ojo inflamado esta llorando', 'amarillo', 1, '3', '2kst61k5mq5alpbsk19j'),
('2kst61rfr039g8r55srtj8', 'niño ojo abra', 'niño con el ojo inflamado esta llorando', 'amarillo', 1, '3', '2kst61k5mq5alpbsk19j'),
('2kst61rtmc3ormgp0d0j', 'niño ojo abra', 'niño con el ojo inflamado esta llorando', 'amarillo', 1, '3', '2kst61k5mq5alpbsk19j'),
('2kst620dt5s2a665c90g', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1', '2kst61k5mq5alpbsk19j'),
('2kst620rgdpqkaoqlkf5', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1', '2kst61k5mq5alpbsk19j'),
('2kst6219o5nmk0q1h7l4h', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1', '2kst61k5mq5alpbsk19j'),
('2kst621l149emme1s1nm', 'abrasion', 'Hombre joven con multiples abrasiones y heridas no profundas, presenta deformidad en el fémur derecho y aplastamiento de la mano izquierda. Está alerta.', 'amarillo', 0, '1', '2kst61k5mq5alpbsk19j'),
('2kst625oef6p6hp5nt31', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4', '2kst61k5mq5alpbsk19j'),
('2kst6268becljsab69ad', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4', '2kst61k5mq5alpbsk19j'),
('2kst626kae38546cnr8j', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4', '2kst61k5mq5alpbsk19j'),
('2kst6273negrs3t24bn', 'chico cuello', 'Chica con corte en el cuello y quemaduras faciales de segundo y tercer grado, constantes normales.', 'rojo', 0, '4', '2kst61k5mq5alpbsk19j'),
('2kst62cf1rab3r03gn15', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2', '2kst61k5mq5alpbsk19j'),
('2kst62cts0o3i2glt4bdr', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2', '2kst61k5mq5alpbsk19j'),
('2kst62dc81hdekojdb4n6', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2', '2kst61k5mq5alpbsk19j'),
('2kst62dnlefe1aa1oahj', 'corte hombre', 'geegtth rth', 'amarillo', 0, '2', '2kst61k5mq5alpbsk19j');

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
('2kst61pj18mfa3638pih', '2kst61k5mq5alpbsk19j', 'escenario1', 1, 9),
('2kst61qs38p9dhch4nk', '2kst61k5mq5alpbsk19j', 'escenario1', 2, 9),
('2kst61rfr039g8r55srtj8', '2kst61k5mq5alpbsk19j', 'escenario1', 3, 9),
('2kst61rtmc3ormgp0d0j', '2kst61k5mq5alpbsk19j', 'escenario1', 4, 9),
('2kst620dt5s2a665c90g', '2kst61k5mq5alpbsk19j', 'escenario1', 1, 10),
('2kst620rgdpqkaoqlkf5', '2kst61k5mq5alpbsk19j', 'escenario1', 2, 10),
('2kst6219o5nmk0q1h7l4h', '2kst61k5mq5alpbsk19j', 'escenario1', 3, 10),
('2kst621l149emme1s1nm', '2kst61k5mq5alpbsk19j', 'escenario1', 4, 10),
('2kst625oef6p6hp5nt31', '2kst61k5mq5alpbsk19j', 'escenario1', 1, 11),
('2kst6268becljsab69ad', '2kst61k5mq5alpbsk19j', 'escenario1', 2, 11),
('2kst626kae38546cnr8j', '2kst61k5mq5alpbsk19j', 'escenario1', 3, 11),
('2kst6273negrs3t24bn', '2kst61k5mq5alpbsk19j', 'escenario1', 4, 11),
('2kst62cf1rab3r03gn15', '2kst61k5mq5alpbsk19j', 'escenario1', 1, 12),
('2kst62cts0o3i2glt4bdr', '2kst61k5mq5alpbsk19j', 'escenario1', 2, 12),
('2kst62dc81hdekojdb4n6', '2kst61k5mq5alpbsk19j', 'escenario1', 3, 12),
('2kst62dnlefe1aa1oahj', '2kst61k5mq5alpbsk19j', 'escenario1', 4, 12);

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
('2kjp343f38on5ig47301', '2kd9fckc7t9tla26e1cj'),
('2kjp343f38on5ig47301', '2kjp366a8h24hm4qmnmk'),
('2kqoqg64o005247d974bg48', '2kd9fckc7t9tla26e1cj');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `acciones`
--
ALTER TABLE `acciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `acciones_paciente`
--
ALTER TABLE `acciones_paciente`
  ADD KEY `accion` (`acciones_id`);

--
-- Indices de la tabla `acciones_paciente_ejercicio`
--
ALTER TABLE `acciones_paciente_ejercicio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `accion` (`acciones_id`);

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
-- Indices de la tabla `imagenes_ejercicio`
--
ALTER TABLE `imagenes_ejercicio`
  ADD PRIMARY KEY (`ejercicio`,`orden`),
  ADD KEY `imagen` (`imagen`);

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
-- AUTO_INCREMENT de la tabla `acciones_paciente_ejercicio`
--
ALTER TABLE `acciones_paciente_ejercicio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- Restricciones para tablas volcadas
--

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
  ADD CONSTRAINT `asig` FOREIGN KEY (`asignatura`) REFERENCES `asignatura` (`id`);

--
-- Filtros para la tabla `imagenes_ejercicio`
--
ALTER TABLE `imagenes_ejercicio`
  ADD CONSTRAINT `ejercicio` FOREIGN KEY (`ejercicio`) REFERENCES `ejercicios` (`id`),
  ADD CONSTRAINT `imagen` FOREIGN KEY (`imagen`) REFERENCES `imagenes` (`id`);

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `imagen_paciente` FOREIGN KEY (`imagen`) REFERENCES `imagenes` (`id`);

--
-- Filtros para la tabla `pacientes_ejercicio`
--
ALTER TABLE `pacientes_ejercicio`
  ADD CONSTRAINT `esta en el ejercicio` FOREIGN KEY (`ejercicio`) REFERENCES `ejercicios` (`id`),
  ADD CONSTRAINT `imagenes_paciente` FOREIGN KEY (`imagen`) REFERENCES `imagenes` (`id`);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sonidos`
--

CREATE TABLE `sonidos` (
  `id` varchar(250) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL UNIQUE,
  `fecha_subida` datetime NOT NULL,
  `descripcion` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fecha` (`fecha_subida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
