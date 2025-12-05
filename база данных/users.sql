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
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','teacher','admin') NOT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `major` varchar(255) DEFAULT NULL,
  `entrance_year` int DEFAULT NULL,
  `avatar_path` varchar(255) DEFAULT '/assets/default_avatar.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `group_name`, `full_name`, `major`, `entrance_year`, `avatar_path`) VALUES
(33, 'herrBerikuly', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', 'KINI', 'Сержан  Майер', 'Немецкий язык', 2024, '/uploads/avatars/33_avatar.jpg'),
(34, 'Berikuly', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'student', 'Логистика', 'Берикулы Сержан', 'Мехатроника. Электротехника и автоматизация', 2024, '/uploads/avatars/34_avatar.jpg'),
(35, 'khankerei', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'student', 'Менеджмент', 'Бурабай Ханкерей', NULL, NULL, '/uploads/avatars/35_avatar.png'),
(36, 'Adilzhan', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'student', 'Мехатроника', 'Бакытжанулы Адильжан', NULL, NULL, '/assets/default_avatar.png'),
(37, 'janserik', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'student', 'Менеджмент', 'Узакберди Жансерик', NULL, NULL, '/assets/default_avatar.png'),
(38, 'serega', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'admin', 'Administration of KINI', 'Admin Serzhan', 'Administration', 2019, '/assets/default_avatar.png'),
(44, 'Mukhtarov.D', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(45, 'Ergozha.A', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(46, 'Uzakberdi.Zh', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(47, 'Ospanov', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(48, 'Kenzhebaeva.Zh', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(49, 'Balgaev.N', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(50, 'Shakhmurat', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'student', 'Мехатроника', 'Оспанов Шахмурат', NULL, NULL, '/assets/default_avatar.png');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
