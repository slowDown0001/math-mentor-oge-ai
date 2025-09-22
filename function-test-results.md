# Function Test Results

Testing functions for user: `58e90a35-9dad-44f3-8822-43e23c816f9a`

## Step 1: student-progress-calculate

**Request:**
```json
{
  "user_id": "58e90a35-9dad-44f3-8822-43e23c816f9a"
}
```

**Expected Response Structure:**
```json
{
  "success": true,
  "progress_bars": [
    {
      "topic": "1.1",
      "задача ФИПИ": "1",
      "навык": "1",
      "prob": 0.75
    },
    // ... more items
  ]
}
```

## Step 2: ogemath-task-hardcode

**Request:**
```json
{
  "goal": "хорошо сдать огэ",
  "hours_per_week": 10,
  "school_grade": 9,
  "days_to_exam": 180,
  "progress": [/* progress data from step 1 */]
}
```

**Expected Response Structure:**
```json
{
  "темы для изучения": ["1.1", "1.2", ...],
  "навыки с наибольшей важностью для выбранных тем": [
    {
      "номер": 1,
      "название": "...",
      "важность": 5
    }
  ],
  "Задачи ФИПИ для тренировки": [1, 6, 7, ...],
  "навыки для подтягивания": [
    {
      "номер": 5,
      "название": "...",
      "текущий уровень": 0.45
    }
  ]
}
```

## Manual Testing Instructions

Run this in browser console:
```javascript
// Test the functions
const testFunctions = async () => {
  const SUPABASE_URL = "https://kbaazksvkvnafrwtmkcw.supabase.co";
  const userId = "58e90a35-9dad-44f3-8822-43e23c816f9a";
  
  try {
    // Step 1: Get progress data
    const progressResponse = await fetch(`${SUPABASE_URL}/functions/v1/student-progress-calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    
    const progressData = await progressResponse.json();
    console.log("Progress Data:", progressData);
    
    // Step 2: Get study plan
    const studyPlanResponse = await fetch(`${SUPABASE_URL}/functions/v1/ogemath-task-hardcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: "хорошо сдать огэ",
        hours_per_week: 10,
        school_grade: 9,
        days_to_exam: 180,
        progress: progressData.progress_bars
      })
    });
    
    const studyPlanData = await studyPlanResponse.json();
    console.log("Study Plan:", studyPlanData);
    
    return { progressData, studyPlanData };
  } catch (error) {
    console.error("Error:", error);
  }
};

testFunctions();
```