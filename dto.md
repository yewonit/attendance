# 📋 **API Request/Response DTO 문서**

---

## 🏢 **Organizations APIs**

### `POST /api/organizations`

```typescript
// RequestDto
interface CreateOrganizationRequest {
	organization_name: string;
	organization_code: string;
	organization_description?: string;
	upper_organization_id?: number;
	description?: string;
}

// ResponseDto
interface CreateOrganizationResponse {
	data: {
		id: number;
		organization_name: string;
		organization_code: string;
		organization_description: string;
	};
}
```

### `GET /api/organizations`

```typescript
// RequestDto: 없음

// ResponseDto
interface FindOrganizationsResponse {
	data: Array<{
		id: number;
		organization_name: string;
		organization_code: string;
		organization_description: string;
	}>;
}
```

### `GET /api/organizations/:id`

```typescript
// RequestDto
interface FindOrganizationRequest {
	// Path params
	id: string;
}

// ResponseDto
interface FindOrganizationResponse {
	data: {
		id: number;
		organization_name: string;
		organization_code: string;
	};
}
```

### `PUT /api/organizations`

```typescript
// RequestDto
interface UpdateOrganizationRequest {
	id: number;
	organization_name?: string;
	organization_code?: string;
	organization_description?: string;
	upper_organization_id?: number;
	description?: string;
}

// ResponseDto
interface UpdateOrganizationResponse {
	[0]: number; // 업데이트된 행 수
}
```

### `GET /api/organizations/:id/members`

```typescript
// RequestDto
interface GetOrganizationMembersRequest {
	// Path params
	id: string;
}

// ResponseDto
interface GetOrganizationMembersResponse {
	members: Array<{
		id: number; // User.id
		name: string;
		email: string;
		roleName: string;
	}>;
}
```

### `GET /api/organizations/:id/activities`

```typescript
// RequestDto
interface GetOrganizationActivitiesRequest {
	// Path params
	id: string;
}

// ResponseDto
interface GetOrganizationActivitiesResponse {
	organizationId: number;
	organizationName: string;
	activities: Array<{
		id: number;
		name: string;
		description: string;
		category: string | null;
		instances: Array<{
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
				status: string | null;
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
		}>;
	}>;
}
```

---

## 🎯 **Activities APIs**

### `POST /api/activities`

```typescript
// RequestDto
interface CreateActivityRequest {
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	organization_id: number;
	category: string;
}

// ResponseDto
interface CreateActivityResponse {
	data: {
		id: number;
		name: string;
		activity_category_id: number;
		organization_id: number;
		location_type: string;
		location: string;
		online_link: string;
		default_start_time: string;
		default_end_time: string;
	};
}
```

---

## 🎭 **Domain Controllers**

### `GET /api/current-members`

```typescript
// RequestDto
interface GetCurrentMembersRequest {
	// Query params
	organizationId: number;
}

// ResponseDto
interface GetCurrentMembersResponse {
	data: Array<{
		userId: number;
		name: string;
		email: string;
		phoneNumber: string;
		organizationId: number;
		roleId: number;
		roleName: string;
	}>;
}
```

### `POST /api/current-members`

```typescript
// RequestDto
interface CreateCurrentMemberRequest {
	userData: {
		name: string;
		name_suffix?: string;
		gender_type?: string;
		birth_date?: string;
		phone_number: string;
		church_registration_date?: string;
		is_new_member?: string;
	};
	organizationId: number;
	idOfCreatingUser: number;
}

// ResponseDto
interface CreateCurrentMemberResponse {
	id: number;
	name: string;
	name_suffix: string;
	gender_type: string;
	birth_date: string;
	phone_number: string;
	church_registration_date: string;
	is_new_member: string;
	created_at: string;
	updated_at: string;
}
```

# 프론트

## 🎯 **Activity Instances APIs**

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
