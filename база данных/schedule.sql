-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Хост: MySQL-8.4
-- Время создания: Дек 04 2025 г., 11:20
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
-- Структура таблицы `schedule`
--

CREATE TABLE `schedule` (
  `id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `day_of_week` varchar(20) NOT NULL,
  `time_slot` varchar(20) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `classroom` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `schedule`
--

INSERT INTO `schedule` (`id`, `teacher_id`, `group_name`, `day_of_week`, `time_slot`, `course`, `classroom`) VALUES
(27, 33, 'Логистика', 'Вторник', '12:50 - 13:40', 'German-D1', 'E-105'),
(28, 33, 'Логистика', 'Вторник', '13:50 - 14:40', 'German-D1', 'E-105'),
(29, 33, 'Логистика', 'Среда', '12:50 - 13:40', 'English', 'E-106'),
(30, 33, 'Логистика', 'Среда', '13:50 - 14:40', 'English', 'E-106'),
(36, 33, 'Менеджмент', 'Понедельник', '10:00 - 10:50', 'macro and micro economy', 'e-102'),
(37, 33, 'Менеджмент', 'Понедельник', '11:00 - 11:50', 'macro and micro economy', 'e-102'),
(46, 33, 'Мехатроника', 'Вторник', '13:50 - 14:40', 'English B1-2', 'E106'),
(48, 33, 'Мехатроника', 'Вторник', '15:50 - 16:40', 'German D1', 'E107'),
(49, 33, 'Мехатроника', 'Вторник', '16:50 - 17:40', 'German D1', 'E107'),
(50, 33, 'Мехатроника', 'Среда', '13:50 - 14:40', 'English B1-1', 'E106'),
(51, 33, 'Мехатроника', 'Среда', '14:50 - 15:40', 'English B1-1', 'E106'),
(52, 33, 'Мехатроника', 'Четверг', '9:00 - 9:50', 'German D1', 'E107'),
(53, 33, 'Мехатроника', 'Четверг', '10:00 - 10:50', 'German D1', 'E107'),
(54, 33, 'Мехатроника', 'Четверг', '11:00 - 11:50', 'German  D2', 'E107'),
(55, 33, 'Мехатроника', 'Четверг', '12:50 - 13:40', 'German D2', 'E107'),
(56, 33, 'Мехатроника', 'Четверг', '13:50 - 14:40', 'English B1-1', 'E106'),
(57, 33, 'Мехатроника', 'Четверг', '14:50 - 15:40', 'English B1-1', 'E106'),
(58, 33, 'Мехатроника', 'Пятница', '9:00 - 9:50', 'Статистика - practice', 'E207'),
(59, 33, 'Мехатроника', 'Пятница', '10:00 - 10:50', 'Статистика-lec', 'E207'),
(60, 33, 'Мехатроника', 'Пятница', '11:00 - 11:50', 'German D2', 'E107'),
(61, 33, 'Мехатроника', 'Пятница', '12:50 - 13:40', 'German D2', 'E107'),
(62, 33, 'Мехатроника', 'Пятница', '13:50 - 14:40', 'Статистика - practice', 'Е207'),
(63, 33, 'Мехатроника', 'Пятница', '15:50 - 16:40', 'Программирование 1', 'Е103'),
(64, 33, 'Логистика', 'Понедельник', '09:00 - 09:50', 'German-D1', 'E-105'),
(65, 33, 'Логистика', 'Понедельник', '10:00 - 10:50', 'German-D1', 'E-105'),
(66, 33, 'Логистика', 'Понедельник', '12:50 - 13:40', 'Programming', 'E-103'),
(67, 33, 'Логистика', 'Понедельник', '13:50 - 14:40', 'Programming', 'E-103'),
(72, 33, 'Логистика', 'Четверг', '09:00 - 09:50', 'German-D1', 'E-105'),
(73, 33, 'Логистика', 'Четверг', '10:00 - 10:50', 'German-D1', 'E-105'),
(74, 33, 'Логистика', 'Четверг', '12:50 - 13:40', 'Math 2', 'E-110'),
(75, 33, 'Логистика', 'Четверг', '13:50 - 14:40', 'Math practice', 'E-110'),
(76, 33, 'Мехатроника', 'Понедельник', '10:00 - 10:50', 'German-D1', 'E-107'),
(77, 33, 'Мехатроника', 'Понедельник', '11:00 - 11:50', 'English B1-2', 'E106'),
(78, 33, 'Мехатроника', 'Понедельник', '12:50 - 13:40', 'English B1-2', 'E106'),
(79, 33, 'Мехатроника', 'Понедельник', '13:50 - 14:40', 'Программирование 1', 'Е103'),
(80, 33, 'Мехатроника', 'Понедельник', '14:50 - 15:40', 'Программирование 1', 'Е103'),
(81, 33, 'Мехатроника', 'Понедельник', '15:50 - 16:40', 'German-D1', 'E107'),
(82, 33, 'Мехатроника', 'Понедельник', '16:50 - 17:40', 'German-D1', 'E107');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `schedule`
--
ALTER TABLE `schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_group_day` (`group_name`,`day_of_week`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `schedule`
--
ALTER TABLE `schedule`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `schedule`
--
ALTER TABLE `schedule`
  ADD CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
