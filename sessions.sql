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
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `session_id`, `expires_at`) VALUES
(61, 34, 'cf4ca83d21e1b5e6d2546ff43b6315cb', '2025-10-05 21:40:57'),
(63, 34, '2be9bbeeee3cccc6e7036f331c16ccdf', '2025-10-05 21:49:02'),
(66, 34, 'fe6fa5a7d7e314c0699018cc22988e20', '2025-10-05 22:18:55'),
(67, 34, '657af1e7fa12453e6ac530659c4f71bb', '2025-10-05 22:19:53'),
(70, 34, '7d507fedac9aba6c7b33b1d71841fc7b', '2025-10-05 23:05:00'),
(86, 33, 'f60c562e3ca9228df3134abfb49a0354', '2025-10-06 00:39:10'),
(89, 33, '84fd158e1e9501401b1b327973c79d3e', '2025-10-06 12:04:19'),
(94, 34, 'b082105f55e341f66879b53108b1b726', '2025-10-06 13:34:38'),
(97, 34, 'fd5393b2db8d25629fa3f9125ce5982e', '2025-10-06 14:44:40'),
(101, 38, '79d055bd6c08fe748f517a114cce7da5', '2025-10-06 20:24:58'),
(102, 34, '904f5b638d60f5f53e97ae77968989a8', '2025-10-07 10:35:13'),
(105, 34, 'b086a7c222bdc311b9e4e757ce71e546', '2025-10-08 21:11:10'),
(108, 34, '5f73479de38678b8be7b60a5aa8d4544', '2025-10-10 11:14:32'),
(111, 34, 'c62da1b268e2d5ce29eba9c37e032e92', '2025-10-10 20:19:58'),
(113, 34, '262b9741267c0c0058f7203d28fc47f2', '2025-10-11 23:09:37'),
(116, 38, '21a6da7b8c69fe76bc88ce8bf962acfa', '2025-10-12 17:29:18'),
(121, 38, '37a5a5c9ec1a290be68ec6d80a768b9f', '2025-10-12 19:23:26'),
(126, 33, '9191e07169834832705349bcd5a45708', '2025-10-12 22:02:57'),
(141, 38, 'c5d6cc71cc964e8d0f41a256cbc97295', '2025-10-13 14:21:53'),
(143, 33, 'cf2879f8bab43770fbff7396ed7f6f26', '2025-10-17 18:17:11'),
(145, 34, '92df3b0cd3230081f590f6edb2941804', '2025-10-18 17:29:19'),
(146, 34, '9a58d8d8769e761201d32991114d63a4', '2025-10-18 21:42:07'),
(147, 34, '9b1c34eae03c57410f1d19475ee5390c', '2025-10-18 22:48:26'),
(148, 34, '335538f432e8105ce5c92cab7ce78238', '2025-10-19 00:22:30'),
(149, 34, '9f7bfba3c5f162b7b1a67f3edd2a7341', '2025-10-19 09:53:42'),
(150, 34, 'c9adeb19ed1908ae9bfdcbda9d8ef28b', '2025-10-19 11:48:05'),
(151, 34, '9b0583c2f0795646a08c42890b1a5bf8', '2025-10-19 13:18:34'),
(152, 34, '6a4f2533135de6ddff78a7230454ed8c', '2025-10-19 14:32:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=158;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
