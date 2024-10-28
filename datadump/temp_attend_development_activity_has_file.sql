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
-- Table structure for table `activity_has_file`
--

DROP TABLE IF EXISTS `activity_has_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_has_file` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '활동-파일 연결 고유 식별자',
  `activity_id` int NOT NULL COMMENT '활동 ID, 관련 활동을 참조',
  `file_id` int NOT NULL COMMENT '파일 ID, 연결된 파일을 참조',
  `is_deleted` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y/N), 연결의 보이기/숨기기 상태 관리',
  `created_at` datetime NOT NULL COMMENT '데이터 생성 일시, 연결 생성 시각',
  `updated_at` datetime NOT NULL COMMENT '데이터 최종 수정 일시, 마지막으로 연결 정보가 수정된 시각',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자 ID, 연결 정보의 최초 생성자',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 ID, 연결 정보의 최종 수정자',
  `creator_ip` varchar(45) NOT NULL COMMENT '데이터를 생성한 사용자 IP 주소, 연결 정보 생성 시 사용된 IP',
  `updater_ip` varchar(45) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 IP 주소, 연결 정보 수정 시 사용된 IP',
  `access_service_id` varchar(50) DEFAULT NULL COMMENT '데이터 유입 채널, 연결 정보가 입력되거나 수정된 경로 정보',
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `file_id` (`file_id`),
  CONSTRAINT `activity_has_file_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `activity_has_file_ibfk_2` FOREIGN KEY (`file_id`) REFERENCES `file` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='활동과 파일 간의 관계를 관리하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_has_file`
--

LOCK TABLES `activity_has_file` WRITE;
/*!40000 ALTER TABLE `activity_has_file` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_has_file` ENABLE KEYS */;
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

-- Dump completed on 2024-08-31 21:47:49
