# ATP SUFA – GitHub Ready (v3)

גרסה זו כוללת:
- כניסה עם אימייל וסיסמה
- סוג מערכת מתוך רשימה שמנוהלת בדאטהבייס
- ניהול בדיקות מלא תחת Admin
- שמירת כל טופס ל-Firestore
- צפייה, עריכה ומחיקה של רשומות בדיקה
- חלוקה ל-4 קבוצות: טרום בדיקה, טרום טיסה, טיסה, בדיקות מקרי קצה
- כפתור הפעלת Admin לחשבון המחובר
- ביטול תלות באינדקס המורכב שגרם לשגיאת Firestore

## קבצים
- index.html
- style.css
- app.js
- firebase-config.js
- firestore.rules

## Firestore Collections
- admins/{uid}
- systemTypes/{docId}
- testDefinitions/{docId}
- atpRecords/{docId}

## מה צריך להפעיל ב-Firebase
1. Authentication → Email/Password
2. Firestore Database
3. Authorized Domains → להוסיף את דומיין GitHub Pages שלך
4. לפרוס את `firestore.rules`

## הפעלה ראשונה
1. צור משתמש עם אימייל וסיסמה
2. התחבר
3. לחץ על הכפתור **הפעל Admin לחשבון הזה**
4. עבור לטאב **Admin**
5. לחץ על **טעינת בדיקות ברירת מחדל**
6. הוסף סוגי מערכת לפי הצורך

## הערות חשובות
- השגיאה על `favicon.ico` היא לא קריטית ואפשר להתעלם ממנה.
- אם כבר פרסת חוקים ישנים, חשוב לפרוס את הקובץ `firestore.rules` החדש.
- בגרסה הזו הרשאת Admin מופעלת דרך יצירת מסמך `admins/{uid}` עבור המשתמש המחובר.
