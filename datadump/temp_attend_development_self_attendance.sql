-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (arm64)
--
-- Host: neo-insp-dev-db.c4jz7krre6ps.ap-northeast-2.rds.amazonaws.com    Database: temp_attend_development
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `self_attendance`
--

DROP TABLE IF EXISTS `self_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `self_attendance` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '자체출결 고유 식별자',
  `organization_1` varchar(100) DEFAULT NULL COMMENT '조직 1의 이름',
  `organization_2` varchar(100) DEFAULT NULL COMMENT '조직 2의 이름',
  `organization_3` varchar(100) DEFAULT NULL COMMENT '조직 3의 이름',
  `organization_4` varchar(100) DEFAULT NULL COMMENT '조직 4의 이름',
  `organization_5` varchar(100) DEFAULT NULL COMMENT '조직 5의 이름',
  `organization_6` varchar(100) DEFAULT NULL COMMENT '조직 6의 이름',
  `organization_7` varchar(100) DEFAULT NULL COMMENT '조직 7의 이름',
  `entry_name` varchar(100) NOT NULL COMMENT '입력자 이름',
  `entry_phone` varchar(20) NOT NULL COMMENT '입력자 전화번호',
  `entry_role` varchar(50) NOT NULL COMMENT '입력자 직분',
  `entry_birthdate` varchar(6) NOT NULL COMMENT '입력자 6자리 생년월일 (YYMMDD)',
  `meeting_name` varchar(100) NOT NULL COMMENT '모임명',
  `is_deleted` char(1) NOT NULL COMMENT '삭제 여부 (Y/N)',
  `created_at` datetime NOT NULL COMMENT '데이터 생성 일시',
  `updated_at` datetime NOT NULL COMMENT '데이터 최종 수정 일시',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자 ID',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 ID',
  `creator_ip` varchar(45) NOT NULL COMMENT '데이터를 생성한 사용자 IP 주소',
  `updater_ip` varchar(45) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 IP 주소',
  `access_service_id` varchar(50) NOT NULL COMMENT '데이터 유입 채널',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='자체 출결 정보를 저장하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `self_attendance`
--

LOCK TABLES `self_attendance` WRITE;
/*!40000 ALTER TABLE `self_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `self_attendance` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-31 21:47:48
