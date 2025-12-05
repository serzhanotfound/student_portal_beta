-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: MySQL-8.4
-- Время создания: Дек 04 2025 г., 11:18
-- Версия сервера: 8.4.6
-- Версия PHP: 8.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `db_01`
--

-- --------------------------------------------------------

--
-- Структура таблицы `academic_events`
--

CREATE TABLE `academic_events` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#8b0000',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `academic_events`
--

INSERT INTO `academic_events` (`id`, `title`, `start_date`, `end_date`, `description`, `color`, `created_at`) VALUES
(1, 'Начало осеннего семестра', '2025-09-01', NULL, NULL, '#1abc9c', '2025-12-01 20:16:46'),
(4, 'Начало зимней сессии', '2025-12-20', '2026-01-05', NULL, '#e74c3c', '2025-12-01 20:16:46'),
(7, 'Неделя 1-Рубежного Контроля', '2025-10-19', '2025-10-26', '', '#2ecc71', '2025-12-02 06:42:09'),
(8, 'Неделя 2-Рубежного Контроля', '2025-12-07', '2025-12-14', '', '#2ecc71', '2025-12-02 06:44:08');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `academic_events`
--
ALTER TABLE `academic_events`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `academic_events`
--
ALTER TABLE `academic_events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
