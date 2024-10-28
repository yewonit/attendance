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
-- Table structure for table `activity_category`
--

DROP TABLE IF EXISTS `activity_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_category` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '활동 카테고리 고유 식별자',
  `name` varchar(50) NOT NULL COMMENT '활동 카테고리 이름, 활동을 구분하는 직관적 명칭',
  `description` text COMMENT '활동 카테고리 설명, 카테고리의 세부 사항 및 목적 설명',
  `activityCategory` varchar(50) DEFAULT NULL COMMENT '활동 카테고리, 활동의 다양한 성격이나 목적을 구분',
  `is_deleted` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y/N), 활동 카테고리의 보이기/숨기기 상태 관리',
  `created_at` datetime NOT NULL COMMENT '데이터 생성 일시, 활동 카테고리가 언제 생성되었는지 추적',
  `updated_at` datetime NOT NULL COMMENT '데이터 최종 수정 일시, 활동 카테고리 수정 기록',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자 ID, 활동 카테고리의 최초 생성자 정보',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 ID, 활동 카테고리의 수정자 정보',
  `creator_ip` varchar(45) NOT NULL COMMENT '데이터를 생성한 사용자 IP 주소, 사용자 위치 및 보안 감사를 위한 정보',
  `updater_ip` varchar(45) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 IP 주소, 보안 감사와 추적을 위한 정보',
  `access_service_id` varchar(50) DEFAULT NULL COMMENT '데이터 유입 채널, 활동 카테고리 형성 경로 정보',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='활동을 분류하고 구분하기 위한 카테고리 정보를 관리하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_category`
--

LOCK TABLES `activity_category` WRITE;
/*!40000 ALTER TABLE `activity_category` DISABLE KEYS */;
INSERT INTO `activity_category` VALUES (1,'예배','하나님께 경배하고 말씀을 듣는 시간입니다.','spiritual','N','2023-05-31 01:00:00','2023-05-31 01:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(2,'모임','신앙 성장과 교제를 위한 소그룹 모임입니다.','fellowship','N','2023-05-31 01:00:00','2023-05-31 01:00:00',1,1,'192.168.0.1','192.168.0.1','1');
/*!40000 ALTER TABLE `activity_category` ENABLE KEYS */;
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

-- Dump completed on 2024-08-31 21:47:47
