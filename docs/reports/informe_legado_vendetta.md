# Informe de Ingeniería Inversa: Vendetta (Legacy PHP)

## 1. Resumen de Arquitectura de Datos
El sistema utiliza una base de datos MySQL (MyISAM/InnoDB) con un prefijo de tabla `mob_`. La estructura principal se centra en:
*   **Usuarios (`mob_usuarios`):** Almacena credenciales, puntos y estado.
*   **Edificios (`mob_edificios`):** Representa las ciudades/bases. Contiene las coordenadas (coord1, coord2, coord3) y los recursos actuales.
*   **Habitaciones (`mob_habitaciones`):** Almacena los niveles de cada edificio (Oficina, Escuela, Armería, etc.) para cada `id_edificio`.
*   **Tropas (`mob_tropas`):** Almacena la cantidad de unidades militares estacionadas en cada edificio.
*   **Entrenamientos (`mob_entrenamientos`):** Almacena los niveles de investigación/tecnología por usuario (global para todos sus edificios).
*   **Misiones (`mob_misiones_todas`):** Tabla de eventos en cola para movimientos de tropas (ataques, transportes, etc.).
*   **Colas de Construcción (`mob_habitaciones_nuevas`, `mob_tropas_nuevas`, `mob_entrenamientos_nuevos`):** Gestionan los tiempos de finalización de acciones asíncronas.

A continuación se adjunta el esquema completo de la base de datos encontrado en `application/configs/vendetta_plus_old.sql`:

```sql
-- phpMyAdmin SQL Dump
-- version 4.0.5
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 13-10-2013 a las 17:57:39
-- Versión del servidor: 5.0.96-community-log
-- Versión de PHP: 5.3.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de datos: `vendetta_plus_old`
--

DELIMITER $$
--
-- Procedimientos
--
$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_baneos`
--

CREATE TABLE IF NOT EXISTS `mob_baneos` (
  `id_ban` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `id_admin` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `motivo` text collate utf8_unicode_ci NOT NULL,
  `fecha_fin` datetime NOT NULL,
  PRIMARY KEY  (`id_ban`),
  KEY `id_usuario` (`id_usuario`,`id_admin`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_batallas`
--

CREATE TABLE IF NOT EXISTS `mob_batallas` (
  `id_batalla` int(11) NOT NULL auto_increment,
  `html` text NOT NULL,
  `atacante` int(11) NOT NULL,
  `defensor` int(11) NOT NULL,
  `resultado` text NOT NULL,
  `pts_atacante` int(11) NOT NULL,
  `pts_defensor` int(11) NOT NULL,
  `pts_perd_atacante` int(11) NOT NULL,
  `pts_perd_defensor` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `recursos_arm` int(11) NOT NULL,
  `recursos_mun` int(11) NOT NULL,
  `recursos_dol` int(11) NOT NULL,
  `recursos_alc` int(11) NOT NULL,
  `id_guerra` int(11) NOT NULL,
  `id_familia_a` int(11) NOT NULL,
  `id_familia_d` int(11) NOT NULL,
  `nombre_a` varchar(255) NOT NULL,
  `nombre_d` varchar(255) NOT NULL,
  PRIMARY KEY  (`id_batalla`),
  KEY `id_guerra` (`id_guerra`),
  KEY `id_familia_a` (`id_familia_a`,`id_familia_d`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_chat`
--

CREATE TABLE IF NOT EXISTS `mob_chat` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `from` varchar(255) NOT NULL default '',
  `to` varchar(255) NOT NULL default '',
  `message` text NOT NULL,
  `sent` datetime NOT NULL default '0000-00-00 00:00:00',
  `recd` int(10) unsigned NOT NULL default '0',
  `id_from` int(11) NOT NULL,
  `id_to` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `id_to` (`id_to`),
  KEY `recd` (`recd`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_edificios`
--

CREATE TABLE IF NOT EXISTS `mob_edificios` (
  `id_edificio` int(5) NOT NULL auto_increment,
  `id_usuario` int(5) NOT NULL,
  `coord1` int(6) NOT NULL,
  `coord2` int(11) NOT NULL,
  `coord3` int(11) NOT NULL,
  `recursos_arm` int(12) NOT NULL,
  `recursos_mun` int(12) NOT NULL,
  `recursos_alc` int(12) NOT NULL,
  `recursos_dol` int(12) NOT NULL,
  `puntos` float NOT NULL default '0',
  `last_update` datetime NOT NULL,
  PRIMARY KEY  (`id_edificio`),
  UNIQUE KEY `coordenadas` (`coord1`,`coord2`,`coord3`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_entrenamientos`
--

CREATE TABLE IF NOT EXISTS `mob_entrenamientos` (
  `id_entrenamiento` int(5) NOT NULL auto_increment,
  `id_usuario` int(3) NOT NULL,
  `rutas` int(3) NOT NULL,
  `armas` int(3) NOT NULL,
  `encargos` int(3) NOT NULL,
  `extorsion` int(3) NOT NULL,
  `administracion` int(3) NOT NULL,
  `contrabando` int(3) NOT NULL,
  `espionaje` int(3) NOT NULL,
  `seguridad` int(3) NOT NULL,
  `proteccion` int(3) NOT NULL,
  `combate` int(3) NOT NULL,
  `tiro` int(3) NOT NULL,
  `explosivos` int(3) NOT NULL,
  `guerrilla` int(3) NOT NULL,
  `psicologico` int(3) NOT NULL,
  `quimico` int(3) NOT NULL,
  `honor` int(3) NOT NULL,
  PRIMARY KEY  (`id_entrenamiento`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  KEY `rutas` (`rutas`),
  KEY `armas` (`armas`),
  KEY `encargos` (`encargos`),
  KEY `extorsion` (`extorsion`),
  KEY `administracion` (`administracion`),
  KEY `contrabando` (`contrabando`),
  KEY `espionaje` (`espionaje`),
  KEY `seguridad` (`seguridad`),
  KEY `proteccion` (`proteccion`),
  KEY `combate` (`combate`),
  KEY `tiro` (`tiro`),
  KEY `explosivos` (`explosivos`),
  KEY `guerrilla` (`guerrilla`),
  KEY `psicologico` (`psicologico`),
  KEY `quimico` (`quimico`),
  KEY `honor` (`honor`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_entrenamientos_nuevos`
--

CREATE TABLE IF NOT EXISTS `mob_entrenamientos_nuevos` (
  `id_entrenamiento_nuevo` int(6) NOT NULL auto_increment,
  `id_usuario` int(6) NOT NULL,
  `id_edificio` int(6) NOT NULL,
  `fecha_fin` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `duracion` int(11) NOT NULL,
  `entrenamiento` text NOT NULL,
  `nivel` int(11) NOT NULL,
  `coord` varchar(15) NOT NULL,
  PRIMARY KEY  (`id_entrenamiento_nuevo`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_errores`
--

CREATE TABLE IF NOT EXISTS `mob_errores` (
  `id_error` int(11) NOT NULL auto_increment,
  `error` text NOT NULL,
  PRIMARY KEY  (`id_error`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_familias`
--

CREATE TABLE IF NOT EXISTS `mob_familias` (
  `id_familia` int(11) NOT NULL auto_increment,
  `etiqueta` varchar(8) NOT NULL,
  `nombre` varchar(35) NOT NULL,
  `logo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `web` text NOT NULL,
  PRIMARY KEY  (`id_familia`),
  FULLTEXT KEY `nombre` (`nombre`,`etiqueta`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_familias_mensajes`
--

CREATE TABLE IF NOT EXISTS `mob_familias_mensajes` (
  `id_mensaje` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `id_familia` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY  (`id_mensaje`),
  KEY `id_familia` (`id_familia`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_familias_miembros`
--

CREATE TABLE IF NOT EXISTS `mob_familias_miembros` (
  `id_miembro` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `id_familia` int(11) NOT NULL,
  `id_rango` int(11) NOT NULL,
  PRIMARY KEY  (`id_miembro`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  KEY `id_familia` (`id_familia`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_familias_rangos`
--

CREATE TABLE IF NOT EXISTS `mob_familias_rangos` (
  `id_rango` int(11) NOT NULL auto_increment,
  `id_familia` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` int(11) NOT NULL default '0',
  `leer_mensaje` int(11) NOT NULL default '0',
  `escribir_mensaje` int(11) NOT NULL default '0',
  `borrar_mensaje` int(11) NOT NULL default '0',
  `aceptar_miembro` int(11) NOT NULL default '0',
  `enviar_circular` int(11) NOT NULL default '0',
  `recibir_circular` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id_rango`),
  KEY `id_familia` (`id_familia`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_familias_solicitudes`
--

CREATE TABLE IF NOT EXISTS `mob_familias_solicitudes` (
  `id_solicitud` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `id_familia` int(11) NOT NULL,
  `texto` text NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY  (`id_solicitud`),
  KEY `id_familia` (`id_familia`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_guerras`
--

CREATE TABLE IF NOT EXISTS `mob_guerras` (
  `id_guerra` int(11) NOT NULL auto_increment,
  `id_familia_1` int(11) NOT NULL,
  `id_familia_2` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `declaracion` text NOT NULL,
  `resumen` text NOT NULL,
  `ganador` int(11) NOT NULL,
  `nombre_1` varchar(255) NOT NULL,
  `nombre_2` varchar(255) NOT NULL,
  `ptos_perd_1` bigint(11) unsigned NOT NULL,
  `ptos_perd_2` bigint(11) unsigned NOT NULL,
  PRIMARY KEY  (`id_guerra`),
  KEY `id_familia_1` (`id_familia_1`,`id_familia_2`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_guerras_rendiciones`
--

CREATE TABLE IF NOT EXISTS `mob_guerras_rendiciones` (
  `id_rendicion` int(11) NOT NULL auto_increment,
  `id_familia_1` int(11) NOT NULL,
  `id_familia_2` int(11) NOT NULL,
  `texto` text NOT NULL,
  `fecha` datetime NOT NULL,
  `type` int(11) NOT NULL,
  PRIMARY KEY  (`id_rendicion`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_habitaciones`
--

CREATE TABLE IF NOT EXISTS `mob_habitaciones` (
  `id_habitacion` int(5) NOT NULL auto_increment,
  `id_edificio` int(5) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `oficina` int(3) NOT NULL default '0',
  `escuela` int(3) NOT NULL default '0',
  `armeria` int(3) NOT NULL default '0',
  `municion` int(3) NOT NULL default '0',
  `cerveceria` int(3) NOT NULL default '0',
  `taberna` int(3) NOT NULL default '0',
  `contrabando` int(3) NOT NULL default '0',
  `almacenArm` int(3) NOT NULL default '0',
  `deposito` int(3) NOT NULL default '0',
  `almacenAlc` int(3) NOT NULL default '0',
  `caja` int(3) NOT NULL default '0',
  `campo` int(3) NOT NULL default '0',
  `seguridad` int(3) NOT NULL default '0',
  `torreta` int(3) NOT NULL default '0',
  `minas` int(3) NOT NULL default '0',
  PRIMARY KEY  (`id_habitacion`),
  UNIQUE KEY `id_edificio` (`id_edificio`),
  KEY `id_usuario` (`id_usuario`),
  KEY `escuela` (`escuela`),
  KEY `oficina` (`oficina`),
  KEY `armeria` (`armeria`),
  KEY `municion` (`municion`),
  KEY `cerveceria` (`cerveceria`),
  KEY `taberna` (`taberna`),
  KEY `contrabando` (`contrabando`),
  KEY `almacenArm` (`almacenArm`),
  KEY `deposito` (`deposito`),
  KEY `almacenAlc` (`almacenAlc`),
  KEY `caja` (`caja`),
  KEY `campo` (`campo`),
  KEY `seguridad` (`seguridad`),
  KEY `torreta` (`torreta`),
  KEY `minas` (`minas`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_habitaciones_nuevas`
--

CREATE TABLE IF NOT EXISTS `mob_habitaciones_nuevas` (
  `id_habitacion_nueva` int(6) NOT NULL auto_increment,
  `id_usuario` int(6) NOT NULL,
  `id_edificio` int(6) NOT NULL,
  `fecha_fin` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `duracion` int(11) NOT NULL,
  `habitacion` text NOT NULL,
  `nivel` int(11) NOT NULL,
  `coord` varchar(15) NOT NULL,
  PRIMARY KEY  (`id_habitacion_nueva`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_edificio` (`id_edificio`),
  KEY `fecha_fin` (`fecha_fin`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_ips_compartidas`
--

CREATE TABLE IF NOT EXISTS `mob_ips_compartidas` (
  `id_compartida` int(11) NOT NULL auto_increment,
  `id_usuario_1` int(11) NOT NULL,
  `id_usuario_2` int(11) NOT NULL,
  PRIMARY KEY  (`id_compartida`),
  KEY `id_user_1` (`id_usuario_1`,`id_usuario_2`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_logueos`
--

CREATE TABLE IF NOT EXISTS `mob_logueos` (
  `id_login` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `ip` varchar(255) collate utf8_unicode_ci NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY  (`id_login`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_logueos_271011`
--

CREATE TABLE IF NOT EXISTS `mob_logueos_271011` (
  `id_login` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `ip` varchar(255) collate utf8_unicode_ci NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY  (`id_login`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_mensajes`
--

CREATE TABLE IF NOT EXISTS `mob_mensajes` (
  `id_mensaje` int(11) NOT NULL auto_increment,
  `remitente` int(11) NOT NULL,
  `destinatario` int(11) NOT NULL,
  `asunto` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_enviado` timestamp NOT NULL default '0000-00-00 00:00:00',
  `borrado_rem` tinyint(4) NOT NULL default '0',
  `borrado_dest` tinyint(4) NOT NULL,
  `id_carpeta` int(11) NOT NULL default '0',
  `leido` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id_mensaje`),
  KEY `destinatario` (`destinatario`),
  KEY `remitente` (`remitente`),
  KEY `borrado_rem` (`borrado_rem`),
  KEY `borrado_dest` (`borrado_dest`),
  KEY `id_carpeta` (`id_carpeta`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_mensajes_avisos`
--

CREATE TABLE IF NOT EXISTS `mob_mensajes_avisos` (
  `id_aviso` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `tipo_aviso` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` datetime NOT NULL,
  `borrado` tinyint(1) NOT NULL,
  PRIMARY KEY  (`id_aviso`),
  KEY `id_usuario` (`id_usuario`,`tipo_aviso`,`borrado`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_mensajes_carpetas`
--

CREATE TABLE IF NOT EXISTS `mob_mensajes_carpetas` (
  `id_carpeta` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  PRIMARY KEY  (`id_carpeta`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_mensajes_no_leidos`
--

CREATE TABLE IF NOT EXISTS `mob_mensajes_no_leidos` (
  `id_usuario` int(11) NOT NULL,
  `remitente` int(11) NOT NULL,
  PRIMARY KEY  (`id_usuario`,`remitente`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_mensajes_old`
--

CREATE TABLE IF NOT EXISTS `mob_mensajes_old` (
  `id_mensaje` int(11) NOT NULL auto_increment,
  `remitente` int(11) NOT NULL,
  `destinatario` int(11) NOT NULL,
  `asunto` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_enviado` timestamp NOT NULL default '0000-00-00 00:00:00',
  `borrado_rem` tinyint(4) NOT NULL default '0',
  `borrado_dest` tinyint(4) NOT NULL,
  `id_carpeta` int(11) NOT NULL default '0',
  `leido` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id_mensaje`),
  KEY `destinatario` (`destinatario`),
  KEY `remitente` (`remitente`),
  KEY `borrado_rem` (`borrado_rem`),
  KEY `borrado_dest` (`borrado_dest`),
  KEY `id_carpeta` (`id_carpeta`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_mercado`
--

CREATE TABLE IF NOT EXISTS `mob_mercado` (
  `id_mercado` int(11) NOT NULL auto_increment,
  `recurso` varchar(3) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `compra_arm` int(11) NOT NULL,
  `compra_mun` int(11) NOT NULL,
  `compra_dol` int(11) NOT NULL,
  `id_vendedor` int(11) NOT NULL,
  `id_comprador` int(11) NOT NULL,
  `cantidad_dev` int(11) NOT NULL,
  `compra_arm_dev` int(11) NOT NULL,
  `compra_mun_dev` int(11) NOT NULL,
  `compra_dol_dev` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `aceptada` tinyint(1) NOT NULL,
  `fecha_fin` datetime NOT NULL,
  PRIMARY KEY  (`id_mercado`),
  KEY `recurso` (`recurso`),
  KEY `id_vendedor` (`id_vendedor`),
  KEY `id_comprador` (`id_comprador`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_misiones`
--

CREATE TABLE IF NOT EXISTS `mob_misiones` (
  `id_mision` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `tropas` text NOT NULL,
  `cantidad` int(11) NOT NULL,
  `coord_dest_1` int(11) NOT NULL,
  `coord_dest_2` int(11) NOT NULL,
  `coord_dest_3` int(11) NOT NULL,
  `coord_orig_1` int(11) NOT NULL,
  `coord_orig_2` int(11) NOT NULL,
  `coord_orig_3` int(11) NOT NULL,
  `mision` int(11) NOT NULL,
  `recursos_arm` int(11) NOT NULL,
  `recursos_mun` int(11) NOT NULL,
  `recursos_alc` int(11) NOT NULL,
  `recursos_dol` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `duracion` int(11) NOT NULL,
  PRIMARY KEY  (`id_mision`),
  KEY `id_usuario` (`id_usuario`),
  KEY `coord_dest` (`coord_dest_1`,`coord_dest_2`,`coord_dest_3`),
  KEY `fecha_fin` (`fecha_fin`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_misiones_todas`
--

CREATE TABLE IF NOT EXISTS `mob_misiones_todas` (
  `id_mision` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `tropas` text NOT NULL,
  `cantidad` int(11) NOT NULL,
  `coord_dest_1` int(11) NOT NULL,
  `coord_dest_2` int(11) NOT NULL,
  `coord_dest_3` int(11) NOT NULL,
  `coord_orig_1` int(11) NOT NULL,
  `coord_orig_2` int(11) NOT NULL,
  `coord_orig_3` int(11) NOT NULL,
  `mision` int(11) NOT NULL,
  `recursos_arm` int(11) NOT NULL,
  `recursos_mun` int(11) NOT NULL,
  `recursos_alc` int(11) NOT NULL,
  `recursos_dol` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `duracion` int(11) NOT NULL,
  PRIMARY KEY  (`id_mision`),
  KEY `id_usuario` (`id_usuario`),
  KEY `mision` (`mision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_premium`
--

CREATE TABLE IF NOT EXISTS `mob_premium` (
  `id_premium` int(11) NOT NULL auto_increment,
  `transaction_id` varchar(60) collate utf8_unicode_ci NOT NULL,
  `trxid` varchar(60) collate utf8_unicode_ci NOT NULL,
  `code` varchar(255) collate utf8_unicode_ci NOT NULL,
  `codes` varchar(255) collate utf8_unicode_ci NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  PRIMARY KEY  (`id_premium`),
  UNIQUE KEY `transaction_id` (`transaction_id`,`trxid`),
  KEY `id_usuario` (`id_usuario`,`id_producto`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_puntos`
--

CREATE TABLE IF NOT EXISTS `mob_puntos` (
  `id_puntos` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `puntos_edificios` int(11) NOT NULL,
  `puntos_tropas` int(11) NOT NULL,
  `puntos_entrenamientos` int(11) NOT NULL,
  `puntos_total` int(11) NOT NULL,
  `revision` int(11) NOT NULL,
  `pos_ranking` int(11) NOT NULL,
  PRIMARY KEY  (`id_puntos`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_ranking`
--

CREATE TABLE IF NOT EXISTS `mob_ranking` (
  `id_ranking` int(11) NOT NULL auto_increment,
  `tipo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `rank` int(11) NOT NULL,
  PRIMARY KEY  (`id_ranking`),
  KEY `tipo` (`tipo`,`id_usuario`,`rank`),
  KEY `tipo_rank` (`tipo`,`rank`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_roles`
--

CREATE TABLE IF NOT EXISTS `mob_roles` (
  `id` int(11) NOT NULL auto_increment,
  `id_rol` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `rol_usuario` (`id_rol`,`id_usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_textos`
--

CREATE TABLE IF NOT EXISTS `mob_textos` (
  `id_texto` int(11) NOT NULL auto_increment,
  `ref` varchar(255) NOT NULL,
  `idioma` varchar(2) NOT NULL,
  `texto` text NOT NULL,
  PRIMARY KEY  (`id_texto`),
  UNIQUE KEY `ref_idioma` (`ref`,`idioma`),
  KEY `ref` (`ref`,`idioma`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_tropas`
--

CREATE TABLE IF NOT EXISTS `mob_tropas` (
  `id_tropa` int(5) NOT NULL auto_increment,
  `id_edificio` int(5) NOT NULL,
  `maton` int(20) NOT NULL default '0',
  `portero` int(20) NOT NULL default '0',
  `acuchillador` int(20) NOT NULL default '0',
  `pistolero` int(20) NOT NULL default '0',
  `ocupacion` int(20) NOT NULL default '0',
  `espia` int(20) NOT NULL default '0',
  `porteador` int(20) NOT NULL default '0',
  `cia` int(20) NOT NULL default '0',
  `fbi` int(20) NOT NULL default '0',
  `transportista` int(20) NOT NULL default '0',
  `tactico` int(20) NOT NULL default '0',
  `francotirador` int(20) NOT NULL default '0',
  `asesino` int(20) NOT NULL default '0',
  `ninja` int(20) NOT NULL default '0',
  `demoliciones` int(20) NOT NULL default '0',
  `mercenario` int(20) NOT NULL default '0',
  `ilegal` int(11) NOT NULL default '0',
  `centinela` int(11) NOT NULL default '0',
  `policia` int(11) NOT NULL default '0',
  `guardaespaldas` int(11) NOT NULL default '0',
  `guardia` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id_tropa`),
  UNIQUE KEY `id_edificio` (`id_edificio`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_tropasDelDupl`
--

CREATE TABLE IF NOT EXISTS `mob_tropasDelDupl` (
  `id_tropa` int(5) NOT NULL auto_increment,
  `id_edificio` int(5) NOT NULL,
  `maton` int(20) NOT NULL default '0',
  `portero` int(20) NOT NULL default '0',
  `acuchillador` int(20) NOT NULL default '0',
  `pistolero` int(20) NOT NULL default '0',
  `ocupacion` int(20) NOT NULL default '0',
  `espia` int(20) NOT NULL default '0',
  `porteador` int(20) NOT NULL default '0',
  `cia` int(20) NOT NULL default '0',
  `fbi` int(20) NOT NULL default '0',
  `transportista` int(20) NOT NULL default '0',
  `tactico` int(20) NOT NULL default '0',
  `francotirador` int(20) NOT NULL default '0',
  `asesino` int(20) NOT NULL default '0',
  `ninja` int(20) NOT NULL default '0',
  `demoliciones` int(20) NOT NULL default '0',
  `mercenario` int(20) NOT NULL default '0',
  `ilegal` int(11) NOT NULL default '0',
  `centinela` int(11) NOT NULL default '0',
  `policia` int(11) NOT NULL default '0',
  `guardaespaldas` int(11) NOT NULL default '0',
  `guardia` int(11) NOT NULL default '0',
  PRIMARY KEY  (`id_tropa`),
  UNIQUE KEY `id_edificio` (`id_edificio`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_tropas_nuevas`
--

CREATE TABLE IF NOT EXISTS `mob_tropas_nuevas` (
  `id_tropa_nueva` int(6) NOT NULL auto_increment,
  `fecha_fin` timestamp NOT NULL default '0000-00-00 00:00:00',
  `id_edificio` int(6) NOT NULL,
  `id_usuario` int(6) NOT NULL,
  `tropa` varchar(20) NOT NULL,
  `cantidad` int(6) NOT NULL,
  `duracion` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  PRIMARY KEY  (`id_tropa_nueva`),
  KEY `id_edificio` (`id_edificio`),
  KEY `id_usuario` (`id_usuario`),
  KEY `fecha_fin` (`fecha_fin`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_tropas_nuevasCopy`
--

CREATE TABLE IF NOT EXISTS `mob_tropas_nuevasCopy` (
  `id_tropa_nueva` int(6) NOT NULL auto_increment,
  `fecha_fin` timestamp NOT NULL default '0000-00-00 00:00:00',
  `id_edificio` int(6) NOT NULL,
  `id_usuario` int(6) NOT NULL,
  `tropa` varchar(20) NOT NULL,
  `cantidad` int(6) NOT NULL,
  `duracion` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  PRIMARY KEY  (`id_tropa_nueva`),
  KEY `id_edificio` (`id_edificio`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_tropas_nuevas_test`
--

CREATE TABLE IF NOT EXISTS `mob_tropas_nuevas_test` (
  `id_tropa_nueva` int(6) NOT NULL auto_increment,
  `fecha_fin` timestamp NOT NULL default '0000-00-00 00:00:00',
  `id_edificio` int(6) NOT NULL,
  `id_usuario` int(6) NOT NULL,
  `tropa` varchar(20) NOT NULL,
  `cantidad` int(6) NOT NULL,
  `duracion` int(11) NOT NULL,
  `tipo` int(11) NOT NULL,
  PRIMARY KEY  (`id_tropa_nueva`),
  KEY `id_edificio` (`id_edificio`),
  KEY `id_usuario` (`id_usuario`),
  KEY `fecha_fin` (`fecha_fin`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_usuarios`
--

CREATE TABLE IF NOT EXISTS `mob_usuarios` (
  `id_usuario` int(5) NOT NULL auto_increment,
  `usuario` varchar(20) NOT NULL,
  `pass` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `last_update` datetime NOT NULL,
  `puntos_edificios` float NOT NULL default '0',
  `puntos_tropas` float NOT NULL default '0',
  `puntos_entrenamientos` float NOT NULL default '0',
  `last_online` datetime NOT NULL,
  `baneado` tinyint(1) NOT NULL default '0',
  `idioma` varchar(2) NOT NULL,
  `login` varchar(255) NOT NULL,
  PRIMARY KEY  (`id_usuario`),
  FULLTEXT KEY `usuario` (`usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_usuarios_nombres`
--

CREATE TABLE IF NOT EXISTS `mob_usuarios_nombres` (
  `id_cambio` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `nombre_nuevo` varchar(255) NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY  (`id_cambio`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mob_vacaciones`
--

CREATE TABLE IF NOT EXISTS `mob_vacaciones` (
  `id_vacacion` int(11) NOT NULL auto_increment,
  `id_usuario` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  PRIMARY KEY  (`id_vacacion`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
```

## 2. Fórmulas Matemáticas Core

### 2.1 Producción de Recursos
La producción por hora de cada recurso depende del nivel del edificio productor correspondiente. Las fórmulas se encuentran en las clases dentro de `library/Mob/Habitacion/Vendetta/`.

*   **Munición:** `10 + round(10 * ((Nivel + 150) / 12)^3)`
    *   *Fuente:* `library/Mob/Habitacion/Vendetta/Municion.php`
*   **Armas:** `10 + round(10 * ((Nivel + 150) / 12)^3)`
    *   *Fuente:* `library/Mob/Habitacion/Vendetta/Armeria.php` (Nota: Usa la misma fórmula que munición en el código analizado).
*   **Alcohol (Cervecería):** `10 + round(50 * ((Nivel + 102) / 2)^2)`
    *   *Fuente:* `library/Mob/Habitacion/Vendetta/Cerveceria.php`
*   **Dólares (Taberna):** `round(2 * ((Nivel + 150) / 9)^3)`
    *   *Consumo de Alcohol:* `(Produccion * 7) + 3`. Si no hay suficiente alcohol, la producción baja proporcionalmente.
    *   *Fuente:* `library/Mob/Habitacion/Vendetta/Taberna.php`
*   **Dólares (Contrabando):** `round(21 * ((Nivel + 20) / 1)^2)`
    *   *Consumo de Alcohol:* `(Produccion * 4) + 1`.
    *   *Fuente:* `library/Mob/Habitacion/Vendetta/Contrabando.php`

### 2.2 Costos de Construcción y Entrenamiento
El costo de mejorar un edificio o investigar una tecnología sigue una progresión cuadrática.
*   **Fórmula General:** `CostoBase * (Nivel + 1)^2`
    *   *Donde:* `Nivel` es el nivel actual (para calcular el costo del siguiente nivel).
    *   *Fuente:* `library/Mob/Habitacion/Abstract.php` (método `getCosto`).

### 2.3 Tiempos
*   **Tiempo de Construcción (Edificios):**
    `Segundos = (Nivel^2 * DuracionBase) / NivelOficina`
    *   *Nota:* Existe una división adicional `/ 3` aplicada al resultado final en el código (`round($segundos / 3)`).
    *   *Fuente:* `library/Mob/Habitacion/Abstract.php` (método `getTiempoMejora`).

*   **Tiempo de Entrenamiento (Investigaciones):**
    `Segundos = round(Nivel^2 * DuracionBase / NivelEscuela)`
    *   *Nota:* También se divide por 3 (`round($segundos / 3)`).
    *   *Fuente:* `library/Mob/Entrenamiento/Abstract.php`.

*   **Tiempo de Reclutamiento (Tropas):**
    `Segundos = DuracionBase / NivelCampoEntrenamiento`
    *   *Fuente:* `library/Mob/Tropa/Abstract.php`.

### 2.4 Mapa y Movimiento
*   **Cálculo de Distancia:**
    `Distancia = round(sqrt(dy^2 + dx^2)) * 1000`
    *   Las coordenadas (x:y:z) se mapean a un plano 2D donde la distancia se calcula con Pitágoras.
    *   *Fuente:* `library/Mob/Edificio.php` (método `getDistancia`).

*   **Tiempo de Viaje:**
    `Tiempo (segundos) = round(((Distancia * 3.3479) / VelocidadMasLenta)^0.2 * 3600)`
    *   *Fuente:* `application/forms/Misiones/Coordenadas.php`.

*   **Consumo de Combustible (Salario):**
    `Costo = floor(Distancia^0.8 * SalarioTotal / 2512)`
    *   *Fuente:* `application/forms/Misiones/Coordenadas.php`.

## 3. Catálogo de Entidades

A continuación se presenta el contenido completo del archivo de configuración `application/configs/gameconfig.php` que define los valores base de todas las entidades.

```php
<?php

/*
formula tiempo habitacion: nivel*nivel*duracion/nivel oficina;
*/

$conf_accionesTropas = array(1 => "atacar", 2 => "transportar", 3 => "estacionar", 4 => "ocupar");

$conf_entrenamientos=array(
	"rutas"=> array("nombre"=>"Planificacion de rutas", "arm"=>500, "mun"=>1200, "dol"=>0, "duracion"=>2000, "puntos"=>"15,5"),
	"encargos"=> array("nombre"=>"Planificacion de encargos", "arm"=>1000, "mun"=>2500, "dol"=>1000, "duracion"=>5000, "puntos"=>"46"),	
    "extorsion"=> array("nombre"=>"Extorsion", "arm"=>1000, "mun"=>2000, "dol"=>0, "duracion"=>3000, "puntos"=>"26"),
	"administracion"=> array("nombre"=>"Administración de base", "arm"=>0, "mun"=>0, "dol"=>5000, "duracion"=>14400, "puntos"=>"76"),
	"contrabando"=> array("nombre"=>"Contrabando", "arm"=>0, "mun"=>0, "dol"=>1500, "duracion"=>9600, "puntos"=>"23,5"),
	"espionaje"=> array("nombre"=>"Espionaje", "arm"=>500, "mun"=>500, "dol"=>300, "duracion"=>4200, "puntos"=>"13"),
	"seguridad"=> array("nombre"=>"Seguridad", "arm"=>1000, "mun"=>4000, "dol"=>1000, "duracion"=>4000, "puntos"=>"61"),
	"proteccion"=> array("nombre"=>"Proteccion de grupo", "arm"=>3000, "mun"=>5000, "dol"=>2000, "duracion"=>5000, "puntos"=>"96"),
	"combate"=> array("nombre"=>"Combate cuerpo a cuerpo", "arm"=>2000, "mun"=>2000, "dol"=>3000, "duracion"=>6200, "puntos"=>"76"),
	"armas"=> array("nombre"=>"Combate de armas a corta distancia", "arm"=>1000, "mun"=>200, "dol"=>3000, "duracion"=>5100, "puntos"=>"53"),
	"tiro"=> array("nombre"=>"Entrenamiento de Tiro", "arm"=>5000, "mun"=>12000, "dol"=>10000, "duracion"=>19200, "puntos"=>"296"),
	"explosivos"=> array("nombre"=>"Fabricación de explosivos", "arm"=>10000, "mun"=>19500, "dol"=>15000, "duracion"=>42000, "puntos"=>"471"),
	"guerrilla"=> array("nombre"=>"Entrenamiento de guerrilla", "arm"=>8000, "mun"=>10000, "dol"=>12000, "duracion"=>20000, "puntos"=>"321"),
	"psicologico"=> array("nombre"=>"Entrenamiento psicologico", "arm"=>2000, "mun"=>5000, "dol"=>16000, "duracion"=>26000, "puntos"=>"301"),
	"quimico"=> array("nombre"=>"Entrenamiento químico", "arm"=>4000, "mun"=>12000, "dol"=>1000, "duracion"=>14400, "puntos"=>"0"),
	"honor"=> array("nombre"=>"Honor", "arm"=>0, "mun"=>0, "dol"=>280000, "duracion"=>92000, "puntos"=>"4201")
);

$conf_habitaciones=array(
	"oficina"=> array("desc" => "El Jefe se encuentra en esta oficina, y aquí, se toman todas las decisiones. Coordina el desarrollo y la velocidad de construcción de las otras áreas. Cuando más nivel, más rápido se desarrollan el resto.", "nombre"=>"Oficina del Jefe", "arm"=>100, "mun"=>200, "dol"=>0, "duracion"=>900, "produccion"=>0, "puntos"=>"6"),
	"escuela"=> array("desc" => "Como ya dice el nombre, esta habitación permite el entrenamiento de \"los chicos\" en nuevas ténicas, permitiéndoles tener más experiencia en combate. Al igual que para la oficina de El Jefe, cuánto más rápido se haga el entrenamiento, más rápido se desarrollan las habilidades.", "nombre"=>"Escuela de especialización", "arm"=>1000, "mun"=>1000, "dol"=>0, "duracion"=>2000, "produccion"=>0, "puntos"=>"31,75"),
	"armeria"=> array("desc" => "Aquí, en la Armería, como dice el nombre, se guardan armas. Serán de gran necesidad para ocupar nuevos lugares, y para entrenamientos en combate. Cuanto mejor desarrollada esté, más armas podrás hacer al mismo tiempo.", "nombre"=>"Armería", "arm"=>12, "mun"=>60, "dol"=>0, "duracion"=>500, "produccion"=>10, "puntos"=>"2,32"),
	"municion"=> array("desc" => "El almacén de munición es similar a la armería. Aquí, se manufactura la munición importante. Es necesaria, en grandes cantidades, al ocupar áreas, así como para su uso en entrenamientos. A diferencia de las armas, la munición se usa mucho más rápido.", "nombre"=>"Almacén de munición", "arm"=>9, "mun"=>15, "dol"=>0, "duracion"=>600, "produccion"=>10, "puntos"=>"1,39"),
	"cerveceria"=> array("desc" => "Esta habitación manufactura alcohol. Desgraciadamente (¿o afortunadamente?) está prohibido y por tanto, muy demandado por la población, así que es un negocio próspero. Sin embargo, necesitarás ciertas estrategias para poder llevarlo hasta los ciudadanos.", "nombre"=>"Cervecería", "arm"=>20, "mun"=>20, "dol"=>0, "duracion"=>1000, "produccion"=>50, "puntos"=>"1,6"),
	"taberna"=> array("desc" => "En la taberna se consume alcohol. Aquí es donde traficas con Alcohol. Ten cuidado de no ser detectado por la Policia, o te saldrá caro. Dado que la taberna se supervisa batante mal, la conversión de alcohol es moderada.", "nombre"=>"Taberna", "arm"=>10, "mun"=>50, "dol"=>0, "duracion"=>1500, "produccion"=>8, "puntos"=>"2,1"),
	"contrabando"=> array("desc" => "Mejor que la taberna funciona el contrabando, podrás vender alcohol con un impacto mucho mayor, lo que naturalmente, beneficia a la caja de los gángsters. Desgraciadamente, esta táctica es arriesgada, y mucho más costosa.", "nombre"=>"Contrabando", "arm"=>2000, "mun"=>5000, "dol"=>500, "duracion"=>4000, "produccion"=>21, "puntos"=>"136"),
	"almacen_arm"=> array("desc" => "En el almacén de armas, se guarda todo el armamento que no se necesita de inmediato. El proceso es automático, y se mantienen allí hasta que sean necesarias. Además, ningún enemigo podrá robártelas de este almacén.", "nombre"=>"Almacén de armas", "arm"=>100, "mun"=>500, "dol"=>0, "duracion"=>9000, "produccion"=>0, "puntos"=>"12"),
	"deposito"=> array("desc" => "El depósito de munición funciona de forma similar al almacén de armas. Se guardan cajas de munición y granadas que no se vayan a usar de inmediato. Además, aquí están más seguras, a salvo del enemigo.", "nombre"=>"Depósito de munición", "arm"=>500, "mun"=>600, "dol"=>0, "duracion"=>12000, "produccion"=>0, "puntos"=>"18"),
	"almacen_alc"=> array("desc" => "Ya que la destilación de alcohol es bastante sencilla, la producción es alta. Para poder almacenarlo sin perder el exceso de producción, necesitas construir un almacén de alcohol. En el mismo, estará a salvo de los enemigos.", "nombre"=>"Almacén de alcohol", "arm"=>200, "mun"=>200, "dol"=>0, "duracion"=>8000, "produccion"=>0, "puntos"=>"7"),
	"caja"=> array("desc" => "Después de realizar un contrabando con éxito, conseguirás una buena cantidad de dólares. Pero, ¡presta atención!. Si no quieres tirar el dinero, debes usar esta caja, para prevenir que desaparezca, y para asegurarte liquidez.", "nombre"=>"Caja fuerte", "arm"=>2000, "mun"=>2000, "dol"=>1000, "duracion"=>16000, "produccion"=>0, "puntos"=>"91"),
	"campo"=> array("desc" => "Tal y como dice el nombre, en el campo de entrenamiento, tus \"chicos\" entrenarán. El mismo, dependerá según el tipo de unidades que puedas producir, por ejemplo, simples delincuentes, asesinos, profesionales, a los que tus enemigos tendrán un respeto extremo. Dependiendo del nivel, las unidades serán creadas en menor tiempo.", "nombre"=>"Campo de entrenamiento", "arm"=>1000, "mun"=>2500, "dol"=>0, "duracion"=>5600, "produccion"=>0, "puntos"=>"61"),
	"seguridad"=> array("desc" => "Al igual que el entrenamiento de luchadores en el campo de entrenamiento, aquí podrás entrenar a los más jóvenes en defensa. En principio, se quedarán permanentemente, siempre en el hogar, y protegiendo sus habitaciones contra enemigos. Si tus gángsters están de vuelta, automáticamente luchan juntos.", "nombre"=>"Seguridad", "arm"=>0, "mun"=>0, "dol"=>0, "duracion"=>6000, "produccion"=>0, "puntos"=>"45"),
	"torreta"=> array("desc" => "A fin de aliviar un poco el trabajo de los defensores, dispones de ciertas construcciones, como esta torreta de fuego automático. Técnicamente, son muy avanzadas, y en el momento en que detecten a un enemigo, abrirán fuego de golpe.", "nombre"=>"Torreta de fuego automático", "arm"=>1000, "mun"=>2000, "dol"=>200, "duracion"=>4500, "produccion"=>0, "puntos"=>"57"),
	"minas"=> array("desc" => "Estas minas son una ayuda incluso más \"agradable\". Tus chicos las repartirán a lo largo de la casa. Cuando algún enemigo la pise sin darse cuenta... ¡Buenas noches!", "nombre"=>"Minas ocultas", "arm"=>2000, "mun"=>2000, "dol"=>150, "duracion"=>3000, "produccion"=>0, "puntos"=>"65.5")
);

$conf_tropas = array(
    "maton"=>array("nombre"=>"Maton", "arm"=>200, "mun"=>1000, "dol"=>0, "duracion"=>1400, "puntos"=>6, "ataque"=>5, "defensa"=>5, "capacidad"=>200, "velocidad"=>1600, "salario"=>1, "requisitos"=>array(), "bonificacionesA"=>array(), "bonificacionesD"=>array()),
    "portero"=>array("nombre"=>"Portero", "arm"=>500, "mun"=>8000, "dol"=>0, "duracion"=>1600, "puntos"=>6, "ataque"=>8, "defensa"=>6, "capacidad"=>400, "velocidad"=>2000, "salario"=>1, "requisitos"=>array(), "bonificacionesA"=>array("extorsion"), "bonificacionesD"=>array("extorsion", "seguridad")),
    "acuchillador"=>array("nombre"=>"Acuchillador", "arm"=>1000, "mun"=>200, "dol"=>0, "duracion"=>2000, "puntos"=>4, "ataque"=>10, "defensa"=>4, "capacidad"=>300, "velocidad"=>2500, "salario"=>1, "requisitos"=>array(), "bonificacionesA"=>array("extorsion", "armas"), "bonificacionesD"=>array("extorsion", "cuerpo")),
    "pistolero"=>array("nombre"=>"Pistolero", "arm"=>2000, "mun"=>3000, "dol"=>0, "duracion"=>1200, "puntos"=>21, "ataque"=>30, "defensa"=>10, "capacidad"=>500, "velocidad"=>2400, "salario"=>2, "requisitos"=>array(), "bonificacionesA"=>array("tiro"), "bonificacionesD"=>array("seguridad", "proteccion")),
    "ocupacion"=>array("nombre"=>"Tropa de Ocupacion", "arm"=>20000, "mun"=>10000, "dol"=>20000, "duracion"=>344000, "puntos"=>251, "ataque"=>1, "defensa"=>10, "capacidad"=>3000, "velocidad"=>2000, "salario"=>500, "requisitos"=>array(), "bonificacionesA"=>array(), "bonificacionesD"=>array()),
    "espia"=>array("nombre"=>"Espia", "arm"=>500, "mun"=>200, "dol"=>0, "duracion"=>14000, "puntos"=>3, "ataque"=>1, "defensa"=>1, "capacidad"=>50, "velocidad"=>400000, "salario"=>1, "requisitos"=>array(), "bonificacionesA"=>array("espionaje"), "bonificacionesD"=>array("espionaje")),
    "porteador"=>array("nombre"=>"Porteador", "arm"=>300, "mun"=>100, "dol"=>1000, "duracion"=>3600, "puntos"=>9, "ataque"=>4, "defensa"=>6, "capacidad"=>10000, "velocidad"=>2400, "salario"=>5, "requisitos"=>array(), "bonificacionesA"=>array("combate"), "bonificacionesD"=>array("combate")),
    "cia"=>array("nombre"=>"Agente de la CIA", "arm"=>7000, "mun"=>10000, "dol"=>2500, "duracion"=>17000, "puntos"=>87, "ataque"=>100, "defensa"=>90, "capacidad"=>3000, "velocidad"=>3400, "salario"=>30, "requisitos"=>array(), "bonificacionesA"=>array("armas", "tiro", "guerrilla"), "bonificacionesD"=>array("proteccion", "guerrilla")),
    "fbi"=>array("nombre"=>"Agente del FBI", "arm"=>4000, "mun"=>6000, "dol"=>1000, "duracion"=>15500, "puntos"=>48, "ataque"=>60, "defensa"=>50, "capacidad"=>2000, "velocidad"=>3000, "salario"=>20, "requisitos"=>array(), "bonificacionesA"=>array("proteccion", "tiro"), "bonificacionesD"=>array("proteccion", "tiro")),
    "transportista"=>array("nombre"=>"Transportista", "arm"=>1000, "mun"=>2000, "dol"=>5000, "duracion"=>17200, "puntos"=>51, "ataque"=>6, "defensa"=>8, "capacidad"=>40000, "velocidad"=>5000, "salario"=>10, "requisitos"=>array(), "bonificacionesA"=>array("psicologico"), "bonificacionesD"=>array("proteccion", "psicologico")),
    "francotirador"=>array("nombre"=>"Francotirador", "arm"=>4000, "mun"=>500, "dol"=>2000, "duracion"=>25000, "puntos"=>28, "ataque"=>200, "defensa"=>10, "capacidad"=>1000, "velocidad"=>6000, "salario"=>20, "requisitos"=>array(), "bonificacionesA"=>array("seguridad", "tiro", "guerrilla", "psicologico"), "bonificacionesD"=>array("tiro", "guerrilla", "psicologico")),
    "asesino"=>array("nombre"=>"Asesino", "arm"=>10000, "mun"=>15000, "dol"=>10000, "duracion"=>6000, "puntos"=>176, "ataque"=>300, "defensa"=>200, "capacidad"=>2000, "velocidad"=>6500, "salario"=>50, "requisitos"=>array(), "bonificacionesA"=>array("seguridad", "proteccion", "tiro", "guerrilla", "psicologico"), "bonificacionesD"=>array("seguridad", "proteccion", "tiro", "guerrilla", "psicologico")),
    "ninja"=>array("nombre"=>"Ninja", "arm"=>2000, "mun"=>1000, "dol"=>30000, "duracion"=>40000, "puntos"=>236, "ataque"=>400, "defensa"=>600, "capacidad"=>5000, "velocidad"=>8000, "salario"=>60, "requisitos"=>array(), "bonificacionesA"=>array("combate", "armas", "guerrilla", "psicologico"), "bonificacionesD"=>array("combate", "armas", "guerrilla", "psicologico")),
    "mercenario"=>array("nombre"=>"Mercenario", "arm"=>80000, "mun"=>120000, "dol"=>50000, "duracion"=>144000, "puntos"=>1176, "ataque"=>1000, "defensa"=>1200, "capacidad"=>12000, "velocidad"=>4500, "salario"=>300, "requisitos"=>array(), "bonificacionesA"=>array("espionaje", "seguridad", "proteccion", "combate", "armas", "tiro", "guerrilla", "psicologico"), "bonificacionesD"=>array("espionaje", "seguridad", "proteccion", "combate", "armas", "tiro", "guerrilla", "psicologico"))
);

//"demolicion"=>array("nombre"=>"Experto en Demolicion", "arm"=>40000, "mun"=>6000, "dol"=>20000, "duracion"=>60000, "puntos"=>281, "ataque"=>2000, "defensa"=>200, "capacidad"=>2500, "velocidad"=>3500, "salario"=>200, "requisitos"=>array(), "bonificacionesA"=>array(), "bonificacionesD"=>array()),
//"tactico"=>array("nombre"=>"Experto Tactico", "arm"=>5000, "mun"=>10000, "dol"=>4000, "duracion"=>20000, "puntos"=>93, "ataque"=>120, "defensa"=>150, "capacidad"=>4000, "velocidad"=>4000, "salario"=>40, "requisitos"=>array(), "bonificacionesA"=>array("seguridad", "tiro", "guerrilla", "psicologico"), "bonificacionesD"=>array("tiro", "guerrilla", "psicologico")),

/*
http://board.vendetta.es/thread.php?postid=378793#post378793
*/

return(object) array(
    "entrenamientos" => $conf_entrenamientos,
    "habitaciones" => $conf_habitaciones,
    "tropas" => $conf_tropas
);
```

## 4. Lógica de Negocio Compleja

### 4.1 Algoritmo de Combate
El sistema de combate se resuelve en `library/Mob/Combat/Abstract.php`.
1.  **Cálculo de Poder:** Se suma el ataque y defensa de todas las tropas participantes. Las bonificaciones de investigación aumentan las stats base de forma cuadrática (`1 + sqrt(NivelInvestigacion)/10`).
2.  **Rondas:** El combate es instantáneo a nivel de código (no hay bucle de rondas visible en el snippet analizado, se calcula un resultado final basado en fórmulas logarítmicas).
3.  **Fórmula de Pérdidas (`scrap_calc`):** Utiliza logaritmos naturales y potencias para determinar el porcentaje de fuerzas restantes.
    *   Variables clave: `aaw` (Attack Attacker Weapon), `avw` (Attack Victim Weapon), etc.
    *   La fórmula core es compleja e involucra constantes como `2.144`, `1.10661` y el número de Euler (`2.718`).
4.  **Robo:** Si el atacante gana, roba recursos basado en la capacidad de carga de las tropas sobrevivientes, respetando los niveles de "Almacenamiento Seguro" (Depósitos) del defensor.

### 4.2 Sistema de Espionaje
*   Se gestiona como un tipo especial de ataque (Misión 6, o Misión 1 "Atacar" con solo espías).
*   Si el ataque contiene **solo espías**, se convierte en misión de Espionaje.
*   El éxito depende del combate entre espías. Si el atacante gana (sus espías sobreviven), recibe un reporte con:
    *   Recursos en el edificio.
    *   Edificios y sus niveles.
    *   Tropas defensoras.
*   Si pierde, el defensor recibe un aviso de que fue espiado.

### 4.3 Ocupación
*   Requiere la tropa especial "Tropa de Ocupacion" (`ocupacion`).
*   Solo se puede ocupar un edificio si **no tiene dueño** (ID usuario 0 o null).
*   Si el edificio ya tiene dueño, la misión falla con el mensaje "El edificio ya esta ocupado".
*   Al ocupar, las tropas enviadas se estacionan y los recursos transportados se depositan en la nueva base.

## 5. Hallazgos y Notas Especiales
1.  **Registro "Random":** El código actual en `application/modules/register/controllers/IndexController.php` asigna niveles aleatorios altos (investigaciones nivel 2-9, edificios nivel 10-30) a los nuevos usuarios. Esto parece ser una configuración de **desarrollo/test**. En un entorno de producción estándar, se esperaría que el usuario empiece con recursos básicos y niveles a 0 o 1.
2.  **Factores de Velocidad:** Existen divisiones por 3 en los tiempos de construcción e investigación, lo que sugiere que el juego corre a una velocidad "x3" respecto a los valores base configurados.
3.  **Validación de Coordenadas:** El sistema busca coordenadas libres aleatorias (`getCoordDisponible`) para situar nuevos edificios si no se especifican.
4.  **Bonificaciones:** Las investigaciones otorgan bonificaciones porcentuales a las tropas basadas en `sqrt(Nivel)/10`.
