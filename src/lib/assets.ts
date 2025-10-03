// src/lib/assets.ts
export const supabaseImg = (file: string) =>
  `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/img/${file}`;

export const moduleImgs = {
  1: supabaseImg("module1-numbers.png"),
  2: supabaseImg("module2-algebra.png"),
  3: supabaseImg("module3-equations.png"),
  4: supabaseImg("module4-sequences.png"),
  5: supabaseImg("module5-functions.png"),
  6: supabaseImg("module6-coordinates.png"),
  7: supabaseImg("module7-geometry.png"),
  8: supabaseImg("module8-probability.png"),
  9: supabaseImg("module9-applied.png"),
  hero: supabaseImg("hero-math.png"),
  mock: supabaseImg("mock-exam.png"),
};
