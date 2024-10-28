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
-- Table structure for table `meeting_attendance`
--

DROP TABLE IF EXISTS `meeting_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meeting_attendance` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '모임출결 고유 식별자. 각 출결 기록을 유일하게 식별하는 데 사용됩니다.',
  `organization_1` varchar(255) DEFAULT NULL COMMENT '조직 1의 이름. 조직의 고유한 이름을 나타냅니다.',
  `organization_2` varchar(255) DEFAULT NULL COMMENT '조직 2의 이름. 조직의 고유한 이름을 나타냅니다.',
  `organization_3` varchar(255) DEFAULT NULL COMMENT '조직 3의 이름. 조직의 고유한 이름을 나타냅니다.',
  `organization_4` varchar(255) DEFAULT NULL COMMENT '조직 4의 이름. 조직의 고유한 이름을 나타냅니다.',
  `organization_5` varchar(255) DEFAULT NULL COMMENT '조직 5의 이름. 조직의 고유한 이름을 나타냅니다.',
  `organization_6` varchar(255) DEFAULT NULL COMMENT '조직 6의 이름. 조직의 고유한 이름을 나타냅니다.',
  `organization_7` varchar(255) DEFAULT NULL COMMENT '조직 7의 이름. 조직의 고유한 이름을 나타냅니다.',
  `entry_name` varchar(255) NOT NULL COMMENT '입력자 이름. 출결 기록을 입력한 사람의 이름입니다.',
  `entry_phone` varchar(255) NOT NULL COMMENT '입력자 전화번호. 출결 기록을 입력한 사람의 전화번호입니다.',
  `entry_role` varchar(255) NOT NULL COMMENT '입력자 직분. 출결 기록을 입력한 사람의 교회 내 직분입니다.',
  `meeting_name` varchar(255) NOT NULL COMMENT '모임명. 해당 출결 기록이 속한 모임의 이름입니다.',
  `participant_count` int NOT NULL COMMENT '참여인원수. 모임에 참여한 총 인원수입니다.',
  `meeting_date` datetime NOT NULL COMMENT '모임날짜. 모임이 열린 날짜입니다.',
  `meeting_image_path` text COMMENT '모임이미지경로. 모임 사진이나 관련 이미지의 저장 경로입니다.',
  `is_deleted` char(255) NOT NULL DEFAULT 'N' COMMENT '삭제 여부. 출결 기록이 삭제되었는지(Y), 아니면 활성 상태인지(N)를 나타냅니다.',
  `created_at` datetime NOT NULL COMMENT '데이터 생성 일시. 출결 기록이 생성된 시각입니다.',
  `updated_at` datetime NOT NULL COMMENT '데이터 최종 수정 일시. 출결 기록이 마지막으로 수정된 시각입니다.',
  `creator_id` int NOT NULL COMMENT '데이터를 생성한 사용자 ID. 출결 기록의 최초 생성자 정보입니다.',
  `updater_id` int NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 ID. 출결 기록의 최종 수정자 정보입니다.',
  `creator_ip` varchar(255) NOT NULL COMMENT '데이터를 생성한 사용자 IP 주소. 출결 기록 생성 시 사용된 사용자의 IP 주소입니다.',
  `updater_ip` varchar(255) NOT NULL COMMENT '데이터를 마지막으로 수정한 사용자 IP 주소. 출결 기록 수정 시 사용된 사용자의 IP 주소입니다.',
  `access_service_id` varchar(255) DEFAULT NULL COMMENT '데이터 유입 채널. 출결 기록이 입력되거나 수정된 경로 정보입니다.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='모임 출결을 기록하는 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting_attendance`
--

LOCK TABLES `meeting_attendance` WRITE;
/*!40000 ALTER TABLE `meeting_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `meeting_attendance` ENABLE KEYS */;
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
