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
-- Table structure for table `activity_child`
--

DROP TABLE IF EXISTS `activity_child`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_child` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '엑티비티 차일드 고유 식별자',
  `activity_id` int NOT NULL COMMENT '관련 엑티비티 ID, 상위 엑티비티를 참조',
  `activity_date` date NOT NULL COMMENT '활동 실행 날짜, 실제 활동이 이루어진 날',
  `start_time` datetime NOT NULL COMMENT '활동 시작 시간, 실제 활동이 시작된 시각',
  `end_time` datetime NOT NULL COMMENT '활동 종료 시간, 실제 활동이 종료된 시각',
  `session_number` int NOT NULL COMMENT '회차 정보, 예: 1회차, 2회차 등',
  `attendance` int DEFAULT NULL COMMENT '참여 인원수, 실제 활동에 참여한 인원 수',
  `notes` text COMMENT '활동에 대한 추가적인 메모나 설명',
  `is_deleted` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y/N), 엑티비티 차일드의 보이기/숨기기 상태 관리',
  `created_at` datetime NOT NULL COMMENT '데이터 생성 일시, 엑티비티 차일드 생성 시각',
  `updated_at` datetime NOT NULL COMMENT '데이터 최종 수정 일시, 마지막으로 엑티비티 차일드 정보가 수정된 시각',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자 ID, 엑티비티 차일드 정보의 최초 생성자',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 ID, 엑티비티 차일드 정보의 최종 수정자',
  `creator_ip` varchar(45) NOT NULL COMMENT '데이터를 생성한 사용자 IP 주소, 엑티비티 차일드 정보 생성 시 사용된 IP',
  `updater_ip` varchar(45) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 IP 주소, 엑티비티 차일드 정보 수정 시 사용된 IP',
  `access_service_id` varchar(50) DEFAULT NULL COMMENT '데이터 유입 채널, 엑티비티 차일드 정보가 입력되거나 수정된 경로 정보',
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  CONSTRAINT `activity_child_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='활동의 구체적인 실행 인스턴스 정보를 관리하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_child`
--

LOCK TABLES `activity_child` WRITE;
/*!40000 ALTER TABLE `activity_child` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_child` ENABLE KEYS */;
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
