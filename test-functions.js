// Test script to call the functions
const SUPABASE_URL = "https://kbaazksvkvnafrwtmkcw.supabase.co";
const userId = "58e90a35-9dad-44f3-8822-43e23c816f9a";

console.log("Testing student-progress-calculate and ogemath-task-hardcode functions...");

// Step 1: Call student-progress-calculate
async function testFunctions() {
  try {
    console.log("Step 1: Calling student-progress-calculate...");
    const progressResponse = await fetch(`${SUPABASE_URL}/functions/v1/student-progress-calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId
      })
    });
    
    const progressData = await progressResponse.json();
    console.log("Progress data received:", JSON.stringify(progressData, null, 2));
    
    if (!progressData.success || !progressData.progress_bars) {
      throw new Error("Failed to get progress data");
    }
    
    // Step 2: Call ogemath-task-hardcode with the progress data
    console.log("\nStep 2: Calling ogemath-task-hardcode...");
    const studyPlanResponse = await fetch(`${SUPABASE_URL}/functions/v1/ogemath-task-hardcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal: "хорошо сдать огэ",
        hours_per_week: 10,
        school_grade: 9,
        days_to_exam: 180,
        progress: progressData.progress_bars
      })
    });
    
    const studyPlanData = await studyPlanResponse.json();
    console.log("Study plan data received:", JSON.stringify(studyPlanData, null, 2));
    
  } catch (error) {
    console.error("Error testing functions:", error);
  }
}

testFunctions();