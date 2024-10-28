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
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '역할 고유 식별자',
  `role_name` varchar(20) NOT NULL COMMENT '역할 이름',
  `organization_id` int NOT NULL COMMENT '소속 조직 ID, 조직 테이블의 ID를 참조',
  `is_deleted` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y: 삭제됨, N: 활성 상태)',
  `created_at` datetime NOT NULL COMMENT '데이터 생성 일시',
  `updated_at` datetime NOT NULL COMMENT '데이터 최종 수정 일시',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자의 ID',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자의 ID',
  `creator_ip` varchar(45) NOT NULL COMMENT '데이터를 생성한 사용자의 IP 주소',
  `updater_ip` varchar(45) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자의 IP 주소',
  `access_service_id` varchar(50) DEFAULT NULL COMMENT '데이터 유입 채널',
  PRIMARY KEY (`id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `role_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='역할 정보를 관리하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'위원장',2,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(2,'부위원장',2,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(3,'국장',3,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(4,'부국장',3,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(5,'총무',3,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(6,'서기',3,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(7,'회계',3,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(8,'회장',37,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(9,'부회장',37,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(10,'총무',37,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(11,'회원',37,'N','2023-05-31 00:00:00','2023-05-31 00:00:00',1,1,'192.168.0.1','192.168.0.1','1');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
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
