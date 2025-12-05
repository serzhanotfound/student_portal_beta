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
-- Структура таблицы `courses`
--

CREATE TABLE `courses` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `teacher_id` int DEFAULT NULL,
  `group_name` varchar(255) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `credits` int DEFAULT '3'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `courses`
--

INSERT INTO `courses` (`id`, `name`, `description`, `teacher_id`, `group_name`, `semester`, `credits`) VALUES
(17, 'Немецкий B1', 'Изучение немецкого языка.', 33, 'Мехатроника', 1, 5),
(18, 'Электротехника', 'Электротех', 49, 'Мехатроника', 1, 5),
(19, 'Электронные компоненты', 'Эл.комп', 49, 'Мехатроника', 1, 5),
(20, 'Программирование', 'Программирование', 48, 'Мехатроника', 1, 5),
(21, 'Физика', 'Механика', 46, 'Мехатроника', 1, 5),
(22, 'Макро и микро экономика', 'Экономика', 44, 'Менеджмент', 1, 4),
(23, 'Статистика', 'Математика 2', 47, 'Менеджмент', 1, 4),
(24, 'Математика', 'Матеша', 44, 'Менеджмент', 1, 4),
(25, 'Программирование', 'Программирование', 48, 'Менеджмент', 1, 4),
(26, 'Логистика', 'Основы логистика', 45, 'Логистика', 1, 5),
(27, 'Макро и микро экономика', 'Экономика', 44, 'Логистика', 1, 4),
(28, 'Английский Интермедиэт', 'Енглиш', 33, 'Логистика', 1, 4);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
