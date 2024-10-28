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
-- Table structure for table `activity`
--

DROP TABLE IF EXISTS `activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '활동 고유 식별자',
  `name` varchar(100) NOT NULL COMMENT '활동의 명칭, 활동을 구분할 수 있는 유니크한 이름',
  `description` text COMMENT '활동에 대한 상세 설명, 활동의 내용, 목적, 기대 효과 등을 포함',
  `start_time` time NOT NULL COMMENT '활동 시작 시간, 활동이 시작되는 정확한 시간',
  `end_time` time NOT NULL COMMENT '활동 종료 시간, 활동이 끝나는 정확한 시간',
  `activity_category_id` int NOT NULL COMMENT '활동 카테고리 ID, 활동이 속하는 카테고리를 참조 (activity_category 테이블 참조)',
  `organizer_type` char(1) NOT NULL COMMENT '주최자 유형, ''B''는 본부, ''C''는 교회, ''O''는 기타를 의미',
  `location` varchar(100) NOT NULL COMMENT '활동이 이루어지는 장소, 구체적인 위치 정보 포함',
  `organizer_name` varchar(100) NOT NULL COMMENT '주최자 이름, 활동을 주최하는 개인 또는 조직의 이름',
  `purpose` text COMMENT '활동 목적, 활동을 통해 달성하고자 하는 목표나 이유',
  `participants` int DEFAULT NULL COMMENT '예상 참여 인원수, 활동에 참여할 것으로 예상되는 인원',
  `organization_id` int NOT NULL COMMENT '활동의 주최 조직 ID, 활동을 주최하는 조직을 식별 (organization 테이블 참조)',
  `is_deleted` char(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y/N), 활동의 삭제 상태 관리',
  `created_at` datetime NOT NULL COMMENT '데이터 생성 일시, 활동 생성 시각',
  `updated_at` datetime NOT NULL COMMENT '데이터 최종 수정 일시, 마지막으로 활동 정보가 수정된 시각',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자 ID, 활동 정보의 최초 생성자',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 ID, 활동 정보의 최종 수정자',
  `creator_ip` varchar(45) NOT NULL COMMENT '데이터를 생성한 사용자 IP 주소, 활동 정보 생성 시 사용된 IP',
  `updater_ip` varchar(45) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 IP 주소, 활동 정보 수정 시 사용된 IP',
  `access_service_id` varchar(50) DEFAULT NULL COMMENT '데이터 유입 채널, 활동 정보가 입력되거나 수정된 경로 정보',
  PRIMARY KEY (`id`),
  KEY `activity_category_id` (`activity_category_id`),
  KEY `organization_id` (`organization_id`),
  CONSTRAINT `activity_ibfk_1` FOREIGN KEY (`activity_category_id`) REFERENCES `activity_category` (`id`),
  CONSTRAINT `activity_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organization` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='활동 정보를 관리하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity`
--

LOCK TABLES `activity` WRITE;
/*!40000 ALTER TABLE `activity` DISABLE KEYS */;
INSERT INTO `activity` VALUES (1,'주일1부','주일 오전 첫 번째 예배입니다.','09:00:00','10:30:00',1,'C','본당','예원교회','주일 오전 첫 번째 예배를 통해 하나님께 경배드리고 말씀을 듣습니다.',200,1,'N','2023-06-01 01:00:00','2023-06-01 01:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(2,'주일2부','주일 오전 두 번째 예배입니다.','11:00:00','12:30:00',1,'C','본당','예원교회','주일 오전 두 번째 예배를 통해 하나님께 경배드리고 말씀을 듣습니다.',250,1,'N','2023-06-01 01:00:00','2023-06-01 01:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(3,'주일3부','주일 오후 예배입니다.','14:00:00','15:30:00',1,'C','본당','예원교회','주일 오후 예배를 통해 하나님께 경배드리고 말씀을 듣습니다.',150,1,'N','2023-06-01 01:00:00','2023-06-01 01:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(4,'수요예배','수요일 저녁 예배입니다.','19:30:00','21:00:00',1,'C','본당','예원교회','수요일 저녁 예배를 통해 하나님께 경배드리고 말씀을 듣습니다.',100,1,'N','2023-06-01 01:00:00','2023-06-01 01:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(5,'금요예배','금요일 저녁 예배입니다.','19:30:00','21:00:00',1,'C','본당','예원교회','금요일 저녁 예배를 통해 하나님께 경배드리고 말씀을 듣습니다.',120,1,'N','2023-06-01 01:00:00','2023-06-01 01:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(6,'새벽예배','매일 아침 새벽예배입니다.','05:00:00','06:00:00',1,'C','본당','예원교회','매일 아침 새벽예배를 통해 하나님께 경배드리고 말씀을 듣습니다.',50,1,'N','2023-06-01 01:00:00','2023-06-01 01:00:00',1,1,'192.168.0.1','192.168.0.1','1'),(7,'원네스 모임','전도회 소그룹 모임입니다.','19:00:00','21:00:00',2,'C','교회 교육관','전도위원회','전도회 소그룹 모임을 통해 신앙 성장과 교제를 나눕니다.',30,2,'N','2023-06-01 01:00:00','2023-06-01 01:00:00',1,1,'192.168.0.1','192.168.0.1','1');
/*!40000 ALTER TABLE `activity` ENABLE KEYS */;
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
