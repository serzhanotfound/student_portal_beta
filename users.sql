-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: MySQL-8.4
-- Generation Time: Oct 19, 2025 at 09:14 PM
-- Server version: 8.4.6
-- PHP Version: 8.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_01`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
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
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `group_name`, `full_name`, `major`, `entrance_year`, `avatar_path`) VALUES
(33, 'herrBerikuly', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'teacher', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(34, 'Berikuly', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'student', 'Логистика', 'Берикулы Сержан', 'Мехатроника. Электротехника и автоматизация', 2024, '/uploads/avatars/34_avatar.png'),
(35, 'khankerei', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'student', 'Менеджмент', NULL, NULL, NULL, '/assets/default_avatar.png'),
(36, 'Adilzhan', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'student', 'Мехатроника', NULL, NULL, NULL, '/assets/default_avatar.png'),
(37, 'janserik', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'student', 'Менеджмент', NULL, NULL, NULL, '/assets/default_avatar.png'),
(38, 'serega', '7ac76431166e88fba41bd502fef2fa1495c844aa7e8b8b083fbe61579a2fea22', 'admin', NULL, NULL, NULL, NULL, '/assets/default_avatar.png'),
(39, 'jans', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'student', NULL, NULL, NULL, NULL, '/assets/default_avatar.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
