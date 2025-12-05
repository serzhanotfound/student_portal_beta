-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: MySQL-8.4
-- Время создания: Дек 04 2025 г., 11:21
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
-- Структура таблицы `student_assessments`
--

CREATE TABLE `student_assessments` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `assessment_type_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `date_recorded` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `student_assessments`
--

INSERT INTO `student_assessments` (`id`, `student_id`, `course_id`, `assessment_type_id`, `score`, `date_recorded`) VALUES
(1, 36, 17, 1, 100.00, '2025-11-28 04:22:27'),
(2, 36, 17, 2, 95.00, '2025-11-28 04:22:27'),
(3, 36, 17, 4, 89.00, '2025-11-28 04:22:27'),
(4, 36, 17, 3, 93.00, '2025-11-28 04:22:27'),
(5, 36, 17, 6, 97.00, '2025-11-28 04:22:27'),
(6, 36, 17, 7, 100.00, '2025-11-28 04:22:27'),
(7, 36, 17, 8, 85.00, '2025-11-28 04:22:27'),
(8, 36, 17, 5, 96.00, '2025-11-28 04:22:27'),
(9, 36, 17, 9, 84.00, '2025-11-28 04:22:27'),
(10, 36, 17, 10, 78.00, '2025-11-28 04:22:27'),
(21, 50, 17, 31, 90.00, '2025-11-28 04:22:27'),
(22, 50, 17, 32, 90.00, '2025-11-28 04:22:27'),
(35, 50, 17, 35, 100.00, '2025-11-28 04:22:27'),
(36, 50, 17, 36, 100.00, '2025-11-28 04:22:27'),
(37, 50, 17, 37, 100.00, '2025-11-28 04:22:27'),
(53, 34, 28, 409, 83.00, '2025-11-28 09:24:52'),
(54, 34, 28, 408, 84.00, '2025-11-28 09:24:52'),
(55, 34, 28, 418, 95.00, '2025-11-28 09:24:52'),
(56, 34, 28, 419, 69.00, '2025-11-28 09:24:52'),
(57, 34, 28, 420, 78.00, '2025-11-28 09:24:52'),
(58, 34, 28, 421, 85.00, '2025-11-28 09:24:52'),
(59, 34, 28, 410, 95.00, '2025-11-28 09:24:52'),
(60, 34, 28, 411, 93.00, '2025-11-28 09:24:52'),
(61, 34, 28, 412, 65.00, '2025-11-28 09:24:52'),
(62, 34, 28, 413, 75.00, '2025-11-28 09:24:52'),
(63, 34, 28, 422, 85.00, '2025-11-28 09:24:52'),
(64, 34, 28, 414, 80.00, '2025-11-28 09:24:52'),
(65, 34, 28, 423, 90.00, '2025-11-28 09:24:52'),
(66, 34, 28, 424, 90.00, '2025-11-28 09:24:52'),
(67, 34, 28, 415, 79.00, '2025-11-28 09:24:52'),
(68, 34, 28, 416, 85.00, '2025-11-28 09:24:52'),
(69, 34, 28, 425, 90.00, '2025-11-28 09:24:52'),
(70, 34, 28, 426, 90.00, '2025-11-28 09:24:52'),
(71, 34, 28, 427, 90.00, '2025-11-28 09:24:52'),
(72, 34, 28, 417, 84.00, '2025-11-28 09:24:52'),
(73, 34, 28, 428, 90.00, '2025-11-28 09:24:52'),
(74, 34, 28, 429, 90.00, '2025-11-28 09:24:52'),
(75, 34, 28, 430, 90.00, '2025-11-28 09:24:52'),
(76, 34, 28, 431, 90.00, '2025-11-28 09:24:52'),
(77, 34, 28, 432, 90.00, '2025-11-28 09:24:52'),
(78, 34, 28, 433, 90.00, '2025-11-28 09:24:52'),
(79, 34, 28, 434, 90.00, '2025-11-28 09:24:52'),
(80, 34, 28, 435, 90.00, '2025-11-28 09:24:52'),
(81, 34, 28, 436, 90.00, '2025-11-28 09:24:52'),
(82, 34, 28, 437, 90.00, '2025-11-28 09:24:52'),
(113, 34, 28, 438, 85.00, '2025-11-28 09:24:52'),
(114, 34, 28, 439, 86.00, '2025-11-28 09:24:52'),
(115, 34, 28, 440, 84.00, '2025-11-28 09:24:52'),
(116, 34, 28, 441, 90.00, '2025-11-28 09:24:52'),
(151, 34, 28, 442, 85.00, '2025-11-28 09:24:52'),
(152, 34, 28, 443, 78.00, '2025-11-28 09:24:52'),
(153, 34, 28, 444, 86.00, '2025-11-28 09:24:52'),
(164, 50, 17, 14, 3.00, '2025-11-28 04:22:27');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `student_assessments`
--
ALTER TABLE `student_assessments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assessment` (`student_id`,`assessment_type_id`),
  ADD KEY `assessment_type_id` (`assessment_type_id`),
  ADD KEY `course_id` (`course_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `student_assessments`
--
ALTER TABLE `student_assessments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=244;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `student_assessments`
--
ALTER TABLE `student_assessments`
  ADD CONSTRAINT `student_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_assessments_ibfk_2` FOREIGN KEY (`assessment_type_id`) REFERENCES `assessment_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_assessments_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
