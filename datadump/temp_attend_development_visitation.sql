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
-- Table structure for table `visitation`
--

DROP TABLE IF EXISTS `visitation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitation` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '심방 고유 식별자',
  `visitor_id` int NOT NULL COMMENT '심방자 ID, 심방을 수행한 직분자의 사용자 ID',
  `visitee_id` int NOT NULL COMMENT '피심방자 ID, 심방을 받은 사용자 ID',
  `visitation_date` date NOT NULL COMMENT '심방 날짜',
  `visitation_content` text NOT NULL COMMENT '심방 내용',
  `is_deleted` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y/N)',
  `created_at` datetime DEFAULT NULL COMMENT '데이터 생성 일시',
  `updated_at` datetime DEFAULT NULL COMMENT '데이터 최종 수정 일시',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자의 ID',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자의 ID',
  `creator_ip` varchar(45) NOT NULL COMMENT '데이터를 생성한 사용자의 IP 주소',
  `updater_ip` varchar(45) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자의 IP 주소',
  `access_service_id` varchar(50) DEFAULT NULL COMMENT '데이터 유입 채널',
  PRIMARY KEY (`id`),
  KEY `visitor_id` (`visitor_id`),
  KEY `visitee_id` (`visitee_id`),
  CONSTRAINT `visitation_ibfk_1` FOREIGN KEY (`visitor_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visitation_ibfk_2` FOREIGN KEY (`visitee_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='심방 정보를 관리하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitation`
--

LOCK TABLES `visitation` WRITE;
/*!40000 ALTER TABLE `visitation` DISABLE KEYS */;
INSERT INTO `visitation` VALUES (41,2607,2609,'2024-06-22','원니스','N','2024-06-22 03:11:47','2024-06-22 03:11:47',2607,2607,'127.0.0.1','127.0.0.1','web'),(42,2607,2595,'2024-06-22','임세철회장 안부전화 함','N','2024-06-22 04:04:09','2024-06-22 04:04:09',2607,2607,'127.0.0.1','127.0.0.1','web'),(43,2607,2595,'2024-04-07','주일 예배후 만남 ','N','2024-06-22 04:05:46','2024-06-22 04:05:46',2607,2607,'127.0.0.1','127.0.0.1','web'),(44,2607,2595,'2024-06-23','예배','N','2024-06-23 02:36:05','2024-06-23 02:36:05',2607,2607,'127.0.0.1','127.0.0.1','web'),(47,2895,2895,'0000-00-00','','N','2024-08-04 05:39:56','2024-08-04 05:39:56',2895,2895,'127.0.0.1','127.0.0.1','web'),(48,2858,2858,'2024-08-04','이선옥 친구와 식당에서. 식사하며 강단 메세지로 포럼후. 기도함','N','2024-08-04 05:41:08','2024-08-04 05:41:08',2858,2858,'127.0.0.1','127.0.0.1','web'),(50,2849,2973,'2024-07-28','*8주 새가족 끝\n*7월 월례회 참석\n*3부 예배 참석 가능\n*전도자:이혜숙 친구 ','N','2024-08-04 07:02:57','2024-08-04 07:02:57',2849,2849,'127.0.0.1','127.0.0.1','web'),(51,2607,2595,'2024-08-11','전화','N','2024-08-11 05:41:59','2024-08-11 05:41:59',2607,2607,'127.0.0.1','127.0.0.1','web'),(52,2846,2846,'2024-08-11','오래 질병으로 고통 속에 병원 입원중에 있는 시은 심방','N','2024-08-11 20:05:17','2024-08-11 20:05:17',2846,2846,'127.0.0.1','127.0.0.1','web'),(53,2846,2846,'2024-03-12','장단기 결석자 심방','N','2024-08-12 10:25:00','2024-08-12 10:25:00',2846,2846,'127.0.0.1','127.0.0.1','web'),(54,2846,2846,'2024-08-13','','N','2024-08-13 10:50:50','2024-08-13 10:50:50',2846,2846,'127.0.0.1','127.0.0.1','web'),(55,2846,2846,'2024-08-17','회원 연락이 잘안되는 회원 심방 이름 변경애','N','2024-08-17 10:57:58','2024-08-17 10:57:58',2846,2846,'127.0.0.1','127.0.0.1','web'),(56,2861,3173,'2024-08-26','8월25일예배왔어요','N','2024-08-26 08:34:12','2024-08-26 08:34:12',2861,2861,'127.0.0.1','127.0.0.1','web'),(57,2861,3174,'2024-08-26','전화소통 \n청라에서 거리멀다고아파서 \n근처에 예배드리는데 \n 전도회 친구들 보고십다고 추석지나고 온다고한다 ','N','2024-08-26 08:36:21','2024-08-26 08:36:21',2861,2861,'127.0.0.1','127.0.0.1','web'),(58,2861,3140,'2024-08-26','예배정착하고있다','N','2024-08-26 08:37:29','2024-08-26 08:37:29',2861,2861,'127.0.0.1','127.0.0.1','web'),(59,2861,3141,'2024-08-26','예배 정착하고 월례회도 참석함\n8월25일','N','2024-08-26 08:38:24','2024-08-26 08:38:24',2861,2861,'127.0.0.1','127.0.0.1','web'),(60,2861,3151,'2024-08-26','대림다민족교회\n이은희집사님과 연겷함\n다락방시작한다고함','N','2024-08-26 10:05:58','2024-08-26 10:05:58',2861,2861,'127.0.0.1','127.0.0.1','web');
/*!40000 ALTER TABLE `visitation` ENABLE KEYS */;
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

-- Dump completed on 2024-08-31 21:47:46
