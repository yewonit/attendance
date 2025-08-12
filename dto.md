# 📋 **API Request/Response DTO 문서**

---

### `POST /organizations/{organizationId}/activities/{activityId}/attendance`

```typescript
// RequestDto
interface CreateActivityInstanceRequest {
	// Path params
	organizationId: number;
	activityId: number;

	// Body
	instanceData: {
		startDateTime: string; // UTC ISO 형식 (예: "2024-01-15T10:00:00.000Z")
		endDateTime: string; // UTC ISO 형식 (예: "2024-01-15T12:00:00.000Z")
		location: string; // 모임 장소
		notes: string; // 모임 메모
	};
	attendances: Array<{
		userId: number;
		status: string; // "출석" | "결석" | "지각"
		checkInTime: string | null; // UTC ISO 형식 또는 null
		checkOutTime: string | null; // UTC ISO 형식 또는 null
		note: string; // 개별 출석 메모
	}>;
	imageInfo?: {
		url: string; // 이미지 URL
		fileName: string; // 파일명
		fileSize: number; // 파일 크기 (bytes)
		fileType: string; // MIME 타입 (예: "image/jpeg")
	} | null;
}

// ResponseDto
interface CreateActivityInstanceResponse {
	result: number; // 1: 성공, 0: 실패
	data?: {
		id: number; // 생성된 인스턴스 ID
		activity_id: number;
		start_datetime: string;
		end_datetime: string;
		actual_location: string;
		notes: string;
		attendance_count: number;
		created_at: string;
	};
	error?: string; // 에러 시 메시지
}
```

### `DELETE /organizations/{organizationId}/activities/{activityId}/instances/{activityInstanceId}`

```typescript
// RequestDto
interface DeleteActivityInstanceRequest {
	// Path params
	organizationId: number;
	activityId: number;
	activityInstanceId: number;
}

// ResponseDto
interface DeleteActivityInstanceResponse {
	result: number; // 1: 성공, 0: 실패
	error?: string; // 에러 시 메시지
}
```

### `PUT /organizations/{organizationId}/activities/{activityId}/instances/{activityInstanceId}/attendance`

```typescript
// RequestDto
interface UpdateActivityInstanceRequest {
	// Path params
	organizationId: number;
	activityId: number;
	activityInstanceId: number;

	// Body (CreateActivityInstanceRequest의 instanceData, attendances, imageInfo와 동일)
	instanceData: {
		startDateTime: string;
		endDateTime: string;
		location: string;
		notes: string;
	};
	attendances: Array<{
		userId: number;
		status: string; // "출석" | "결석" | "지각"
		checkInTime: string | null;
		checkOutTime: string | null;
		note: string;
	}>;
	imageInfo?: {
		url: string;
		fileName: string;
		fileSize: number;
		fileType: string;
	} | null;
}

// ResponseDto
interface UpdateActivityInstanceResponse {
	result: number; // 1: 성공, 0: 실패
	error?: string; // 에러 시 메시지
}
```

### `GET /organizations/{organizationId}/activities/{activityId}/instances/{activityInstanceId}`

```typescript
// RequestDto
interface GetActivityInstanceDetailsRequest {
	// Path params
	organizationId: number;
	activityId: number;
	activityInstanceId: number;
}

// ResponseDto
interface GetActivityInstanceDetailsResponse {
	result: number; // 1: 성공, 0: 실패
	activityInstance?: {
		id: number;
		activity_id: number;
		start_datetime: string;
		end_datetime: string;
		actual_location: string;
		notes: string;
		attendance_count: number;
		is_canceled: boolean;
		created_at: string;
		updated_at: string;
		attendances: Array<{
			userId: number;
			userName: string;
			userEmail: string;
			userPhoneNumber: string;
			status: string; // "출석" | "결석" | "지각"
			check_in_time: string;
			check_out_time: string;
			note: string;
		}>;
		images: Array<{
			id: number;
			fileName: string;
			filePath: string;
			fileType: string;
			fileSize: number;
		}>;
	};
	error?: string;
}
```

---
