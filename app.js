import { db, auth } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const DEFAULT_TESTS = [
  { code: '0.1', section: 'טרום בדיקה', equipmentType: 'תחנת ECTS / RMS', title: 'וידוא גרסת RMS בתחנת ECTS', method: 'להיכנס לממשק התחנה / RMS ולוודא שמספר הגרסה תואם לדרישה.', active: true },
  { code: '0.2', section: 'טרום בדיקה', equipmentType: 'רחפן / EDGE', title: 'וידוא גרסת EDGE של הפלטפורמה', method: 'לוודא בממשק EDGE שהגרסה תואמת לדרישה המבצעית.', active: true },
  { code: '0.3', section: 'טרום בדיקה', equipmentType: 'רחפן / סופה', title: 'וידוא גרסת SHOB / סופה', method: 'לוודא ב־RMS/טלמטריה שהפלטפורמה מדווחת גרסת SHOB הנכונה.', active: true },
  { code: '1.1', section: 'טרום בדיקה', equipmentType: 'רחפן', title: 'בדיקת סוללה מעל 24.5V', method: 'למדוד מתח בסוללה או בטלמטריה ולוודא מעל 24.5 וולט.', active: true },
  { code: '1.2', section: 'טרום בדיקה', equipmentType: 'תחנת ECTS / EGT', title: 'בדיקת קבלים ומחברים בתחנה', method: 'לבצע בדיקה ויזואלית של כלל הקבלים והמחברים ולוודא שאין קרעים, ניתוקים או פינים עקומים.', active: true },
  { code: '1.3', section: 'טרום בדיקה', equipmentType: 'תחנת ECTS / EGT', title: 'בדיקה ויזואלית – תחנת הקרקע', method: 'בדיקת שלמות מארז, נורות סטטוס, שקעי חיבור, מאווררים ופגיעות חיצוניות.', active: true },
  { code: '1.4', section: 'טרום בדיקה', equipmentType: 'רחפן', title: 'בדיקה ויזואלית – הרחפן', method: 'בדיקת זרועות, מנועים, חיווט, אנטנות ושלמות כללית של גוף הרחפן.', active: true },
  { code: '1.5', section: 'טרום בדיקה', equipmentType: 'רחפן', title: 'בדיקת פרופים – הרכבה והידוק', method: 'לוודא שכל פרופ מותקן בכיוון הנכון, מהודק למומנט המתאים וללא חופש.', active: true },
  { code: '1.6', section: 'טרום בדיקה', equipmentType: 'רחפן', title: 'ניקיון ועדשת מצלמה', method: 'לנקות את עדשת המטעד/מצלמה ולוודא שאין לכלוכים או שריטות משמעותיות.', active: true },
  { code: '2.1', section: 'טרום טיסה', equipmentType: 'משותף (תחנה–רחפן)', title: 'חיבור כבל Ethernet', method: 'לחבר את כבל ה־Ethernet בין התחנה לרחפן ולוודא שנוריות החיבור דולקות.', active: true },
  { code: '2.2', section: 'טרום טיסה', equipmentType: 'תחנת ECTS / EGT', title: 'הפעלת התחנה', method: 'להדליק את תחנת הקרקע ולוודא עלייה מלאה ללא התראות שגיאה קריטיות.', active: true },
  { code: '2.3', section: 'טרום טיסה', equipmentType: 'משותף (תחנה–רחפן)', title: 'בדיקת סוללת גיבוי ברחפן', method: 'לנתק את מתח התחנה ל־10 שניות, לוודא שהרחפן ממשיך לפעול על סוללת גיבוי, ולאחר מכן להחזיר מתח.', active: true },
  { code: '2.4', section: 'טרום טיסה', equipmentType: 'משותף (תחנה–רחפן)', title: 'זיהוי הרחפן במערכת', method: 'לוודא שהרחפן מזוהה במערכת הניהול (RMS) ושהטלמטריה מתקבלת.', active: true },
  { code: '2.5', section: 'טרום טיסה', equipmentType: 'משותף (תחנה–רחפן)', title: 'בדיקת וידאו/חיישנים', method: 'להציג וידאו/פיד חיישנים ולוודא תמונה יציבה וללא הפרעות חריגות.', active: true },
  { code: '2.6', section: 'טרום טיסה', equipmentType: 'רחפן / בקר טיסה', title: 'וידוא פרמטרים של בקר הטיסה (Mission Planner)', method: 'להיכנס ל־Mission Planner ולוודא פרמטרים קריטיים (ניווט, גבהים, failsafe וכו׳) לפי טבלת ייחוס.', active: true },
  { code: '3.1', section: 'טרום טיסה', equipmentType: 'משותף (תחנה–רחפן)', title: 'שליחת דקירת מיקום', method: 'לבצע דקירת מיקום (Home/Target) דרך המערכת לנקודה שנבחרה.', active: true },
  { code: '3.2', section: 'טרום טיסה', equipmentType: 'משותף (תחנה–רחפן)', title: 'וידוא קבלת הדקירה', method: 'לוודא שהרחפן קיבל את המיקום בממשק הטלמטריה/בקר הטיסה.', active: true },
  { code: '3.3', section: 'טרום טיסה', equipmentType: 'רחפן', title: 'פלטפורמה מוכנה להמראה', method: 'לוודא שמצב הרחפן ARMABLE/READY ללא תקלות חוסמות.', active: true },
  { code: '4.1', section: 'טיסה', equipmentType: 'רחפן', title: 'ביצוע המראה', method: 'לבצע המראה אוטומטית/מונחית ולוודא עלייה יציבה.', active: true },
  { code: '4.2', section: 'טיסה', equipmentType: 'רחפן', title: 'הגעה לגובה יעד', method: 'לוודא שהרחפן מגיע לגובה היעד שהוגדר ללא חריגות.', active: true },
  { code: '5.1', section: 'טיסה', equipmentType: 'רחפן / ג׳ויסטיק', title: 'שליטה ידנית – ימין/שמאל', method: 'לבצע תזוזה אופקית ימין/שמאל באמצעות הג׳ויסטיק ולוודא תגובה חלקה.', active: true },
  { code: '5.2', section: 'טיסה', equipmentType: 'רחפן / ג׳ויסטיק', title: 'שליטה ידנית – עלייה/ירידה', method: 'לשנות גובה ידנית ולוודא תגובה יציבה ללא אוסילציות חריגות.', active: true },
  { code: '5.3', section: 'טיסה', equipmentType: 'רחפן / ג׳ויסטיק', title: 'סבסוב (Yaw)', method: 'לבצע סבסוב סביב ציר האנך ולוודא שליטה מדויקת.', active: true },
  { code: '5.4', section: 'טיסה', equipmentType: 'רחפן / ג׳ויסטיק', title: 'פונקציונליות מלאה בג׳ויסטיק', method: 'לבדוק שכל הצירים והפקדים הפעילים בג׳ויסטיק מגיבים כמצופה.', active: true },
  { code: '6.1', section: 'טיסה', equipmentType: 'רחפן', title: 'עלייה לגובה 70 מטר', method: 'להעלות את הרחפן לגובה של כ־70 מ׳ בהתאם למגבלות הבטיחות.', active: true },
  { code: '6.2', section: 'טיסה', equipmentType: 'רחפן', title: 'יציבות בגובה מקסימלי', method: 'להשאיר את הרחפן בגובה זה ולוודא יציבות במיקום ובגובה.', active: true },
  { code: '7.1', section: 'טיסה', equipmentType: 'רחפן / מטעד', title: 'הפניית מטעד (MAP)', method: 'לכוון את המטעד לנקודות עניין במרחב באמצעות המערכת/ג׳ויסטיק.', active: true },
  { code: '7.2', section: 'טיסה', equipmentType: 'רחפן / מטעד', title: 'תגובה חלקה של המטעד', method: 'לוודא שהמטעד נע בצורה רציפה וללא רעידות חריגות.', active: true },
  { code: '8.1', section: 'טיסה', equipmentType: 'רחפן / מטעד', title: 'הפעלת מטעד מג׳ויסטיק', method: 'לבצע הפעלה ושליטה במטעד מג׳ויסטיק ולוודא תפקוד מלא.', active: true },
  { code: '8.2', section: 'טיסה', equipmentType: 'רחפן / מטעד', title: 'יציבות מטעד לאורך 10 דקות', method: 'להשאיר את המטעד במצב כוונה קבוע ולוודא שאין זחילה או רעידות.', active: true },
  { code: '9.1', section: 'טיסה', equipmentType: 'רחפן', title: 'ירידה לגובה 20 מטר', method: 'להנמיך מגובה הטיסה ל־20 מ׳ ולוודא שהירידה יציבה.', active: true },
  { code: '9.2', section: 'טיסה', equipmentType: 'רחפן / ביקון', title: 'נעילה על ביקון', method: 'לוודא שהמערכת ננעלת על הביקון ושומרת מיקום ביחס אליו.', active: true },
  { code: '9.3', section: 'טיסה', equipmentType: 'רחפן', title: 'נחיתה אוטומטית', method: 'לבצע נחיתה אוטומטית ולוודא רצף תנועות תקין עד עצירה.', active: true },
  { code: '9.4', section: 'טיסה', equipmentType: 'רחפן', title: 'איכות הנחיתה', method: 'לוודא שהרחפן נחת במרכז האזור המיועד ללא החלקה או קפיצות חריגות.', active: true },
  { code: '10.1', section: 'טיסה', equipmentType: 'רחפן / מערכת', title: 'מוכנות מחודשת לאחר 3 דקות', method: 'להמתין כ־3 דקות לאחר נחיתה ולוודא שהמערכת והרחפן מוכנים שוב להמראה.', active: true },
  { code: '10.2', section: 'טיסה', equipmentType: 'רחפן', title: 'המראה שנייה', method: 'לבצע המראה נוספת ולוודא שהמערכת מתפקדת תקין גם בסייקל שני.', active: true },
  { code: '10.3', section: 'טיסה', equipmentType: 'רחפן', title: 'עלייה חוזרת לגובה מקסימלי', method: 'להעלות שוב לגובה היעד ולוודא יציבות.', active: true },
  { code: '11.1', section: 'בדיקות מקרי קצה', equipmentType: 'רחפן', title: 'נחיתת חירום', method: 'להפעיל נוהל נחיתת חירום מהגובה המוגדר ולוודא ביצוע תקין.', active: true },
  { code: '11.2', section: 'בדיקות מקרי קצה', equipmentType: 'רחפן', title: 'סטייה מרדיוס נחיתה ≤ 3 מטר', method: 'למדוד מרחק מנקודת הנחיתה בפועל למרכז האזור ולוודא סטייה עד 3 מ׳.', active: true },
  { code: '11.3', section: 'בדיקות מקרי קצה', equipmentType: 'תחנת EGT', title: 'בדיקת גלילה (EGT בלבד)', method: 'לוודא שבתחנת EGT הגלילה מאטה בעשרת המטרים האחרונים והמתח נשמר בתחום המותר.', active: true },
  { code: '12.1', section: 'טיסה', equipmentType: 'רחפן', title: 'החזרת רחפן לנקודת המראה', method: 'לטוס או לפקד על הרחפן לחזור לנקודת המראה ולוודא דיוק.', active: true },
  { code: '12.2', section: 'טיסה', equipmentType: 'רחפן', title: 'המראה לטיסת משך', method: 'לבצע המראה לטיסת משך לפי תכנון הניסוי.', active: true },
  { code: '13.1', section: 'טיסה', equipmentType: 'רחפן', title: 'טיסת משך – כשעתיים', method: 'להטיס את הרחפן למשך המתוכנן ולוודא שאין התראות קריטיות.', active: true },
  { code: '13.2', section: 'טיסה', equipmentType: 'רחפן', title: 'שינויי גובה במהלך טיסת משך', method: 'לבצע שינויים בגובה ולוודא תגובה תקינה לאורך הטיסה.', active: true },
  { code: '13.3', section: 'טיסה', equipmentType: 'רחפן / ניווט', title: 'ניווט חסין יציב', method: 'לוודא שהניווט החסין פועל, כולל מעבר בין מקורות ניווט ללא קפיצות.', active: true },
  { code: '13.4', section: 'טיסה', equipmentType: 'רחפן / מערכת הספק', title: 'מוניטור זרמים/מתחים', method: 'לעקוב אחרי זרמים ומתחים ולוודא שאין חריגות ביחס למפרט.', active: true },
  { code: '13.5', section: 'טיסה', equipmentType: 'רחפן / מטעד', title: 'תפעול מטעד לאורך טיסת המשך', method: 'להפעיל את המטעד מספר פעמים במהלך הטיסה ולוודא תפקוד מלא.', active: true },
  { code: '13.6', section: 'טיסה', equipmentType: 'משותף (קישור נתונים)', title: 'תקשורת יציבה לאורך כל הטיסה', method: 'לוודא רציפות תקשורת (Telemetry/Video) ללא ניתוקים משמעותיים.', active: true },
  { code: '14.1', section: 'טיסה', equipmentType: 'רחפן', title: 'נחיתה סופית מדויקת', method: 'לבצע נחיתה סופית ולוודא מיקום מדויק באזור המיועד.', active: true },
  { code: '14.2', section: 'טיסה', equipmentType: 'משותף (מערכת)', title: 'סיום טיסה ותיעוד', method: 'לשמור לוגים, לתעד תקלות ולסגור את המערכת לפי הנהלים.', active: true },
  { code: 'EC-1', section: 'בדיקות מקרי קצה', equipmentType: 'משותף (תחנה–רחפן)', title: 'כיבוי מתח חשמל חוץ', method: 'לנתק מתח חשמל חוץ ולוודא שהמערכת מזהה את האירוע ומתנהגת לפי דרישות הבטיחות והקונפיגורציה.', active: true },
  { code: 'EC-2', section: 'בדיקות מקרי קצה', equipmentType: 'רחפן / בטיחות', title: 'וידוא כניסה לנחיתת חירום', method: 'לייצר תנאי כשל רלוונטי ולוודא שהרחפן מבצע כניסה לנחיתת חירום כנדרש.', active: true },
  { code: 'EC-3', section: 'בדיקות מקרי קצה', equipmentType: 'ניווט / GPS', title: 'איבוד מפה – וידוא כניסה לעבודה על GPS ושליטה תקינה', method: 'לייצר איבוד מפה ולוודא שהמערכת נכנסת לעבודה על GPS ושומרת על שליטה תקינה.', active: true },
  { code: 'EC-4', section: 'בדיקות מקרי קצה', equipmentType: 'תקשורת', title: 'בדיקת נתק תקשורת', method: 'לנתק תקשורת ולוודא שהרחפן נכנס לנחיתת חירום לאחר הזמן שהוגדר בקונפיגורציה.', active: true },
  { code: 'EC-5', section: 'בדיקות מקרי קצה', equipmentType: 'ניווט חסין / תקשורת', title: 'הפלת ניווט חסין מלא וניתוק תקשורת', method: 'לייצר הפלת ניווט חסין מלא יחד עם ניתוק תקשורת ולוודא ביצוע נחיתת חירום לאחר זמן הקונפיגורציה.', active: true },
  { code: 'EC-6', section: 'בדיקות מקרי קצה', equipmentType: 'ניווט / תקשורת', title: 'בדיקת איבוד ניווט מלא ונתק תקשורת', method: 'לייצר איבוד ניווט מלא יחד עם נתק תקשורת ולוודא תגובת failsafe מלאה ונחיתת חירום כנדרש.', active: true }
];

const SECTION_ORDER = ['טרום בדיקה', 'טרום טיסה', 'טיסה', 'בדיקות מקרי קצה'];
const STATUS_OPTIONS = ['', 'עבר', 'נכשל', 'לא רלוונטי'];
const STATUS_META = {
  '': { icon: '◻️', className: 'status-empty', label: 'בחר' },
  'עבר': { icon: '✅', className: 'status-pass', label: 'עבר' },
  'נכשל': { icon: '❌', className: 'status-fail', label: 'נכשל' },
  'לא רלוונטי': { icon: '➖', className: 'status-na', label: 'לא רלוונטי' }
};

const state = { user: null, isAdmin: false, systemTypes: [], tests: [], records: [], currentRecordId: null, editingTestId: null };
const $ = (id) => document.getElementById(id);

const els = {
  loginScreen: $('loginScreen'), mainScreen: $('mainScreen'), authMessage: $('authMessage'),
  loginEmail: $('loginEmail'), loginPassword: $('loginPassword'), loginBtn: $('loginBtn'), registerBtn: $('registerBtn'),
  logoutBtn: $('logoutBtn'), userBadge: $('userBadge'), adminTabBtn: $('adminTabBtn'), sectionsContainer: $('sectionsContainer'),
  systemTypeSelect: $('systemTypeSelect'), testerName: $('testerName'), testDate: $('testDate'), location: $('location'),
  stationId: $('stationId'), platformId: $('platformId'), generalNotes: $('generalNotes'), saveRecordBtn: $('saveRecordBtn'),
  saveDraftBtn: $('saveDraftBtn'), loadDraftBtn: $('loadDraftBtn'), saveMessage: $('saveMessage'), newRecordBtn: $('newRecordBtn'),
  bootstrapAdminBox: $('bootstrapAdminBox'), bootstrapAdminBtn: $('bootstrapAdminBtn'), bootstrapAdminMessage: $('bootstrapAdminMessage'),
  addSystemTypeBtn: $('addSystemTypeBtn'), saveSystemTypeBtn: $('saveSystemTypeBtn'), newSystemTypeName: $('newSystemTypeName'),
  systemTypesList: $('systemTypesList'), loadDefaultsBtn: $('loadDefaultsBtn'), saveTestBtn: $('saveTestBtn'),
  clearTestEditorBtn: $('clearTestEditorBtn'), testSectionInput: $('testSectionInput'), testCodeInput: $('testCodeInput'),
  testEquipmentInput: $('testEquipmentInput'), testTitleInput: $('testTitleInput'), testMethodInput: $('testMethodInput'),
  testsAdminList: $('testsAdminList'), recordsTableBody: $('recordsTableBody'), modalOverlay: $('modalOverlay'),
  modalTitle: $('modalTitle'), modalContent: $('modalContent'), closeModalBtn: $('closeModalBtn'),
  testsAdminMessage: $('testsAdminMessage'), recordsAdminMessage: $('recordsAdminMessage'), systemTypesMessage: $('systemTypesMessage')
};

function message(el, text, isError = false) {
  if(!el) return;
  el.textContent = text;
  el.style.color = isError ? '#fca5a5' : '#86efac';
  setTimeout(() => { el.textContent = ''; }, 6000);
}

document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
  $(btn.dataset.tab).classList.remove('hidden');
}));

els.closeModalBtn.addEventListener('click', () => els.modalOverlay.classList.add('hidden'));
els.modalOverlay.addEventListener('click', (e) => { if (e.target === els.modalOverlay) els.modalOverlay.classList.add('hidden'); });
els.loginBtn.addEventListener('click', loginUser);
els.registerBtn.addEventListener('click', registerUser);
els.logoutBtn.addEventListener('click', () => signOut(auth));
els.saveRecordBtn.addEventListener('click', saveCurrentRecord);
els.saveDraftBtn.addEventListener('click', saveDraftRecord);
els.loadDraftBtn.addEventListener('click', loadLatestDraft);
els.newRecordBtn.addEventListener('click', resetForm);
els.bootstrapAdminBtn.addEventListener('click', enableAdminForCurrentUser);

if(els.saveSystemTypeBtn) els.saveSystemTypeBtn.addEventListener('click', saveSystemType);
if(els.loadDefaultsBtn) els.loadDefaultsBtn.addEventListener('click', loadDefaultTests);
if(els.saveTestBtn) els.saveTestBtn.addEventListener('click', saveTestDefinition);
if(els.clearTestEditorBtn) els.clearTestEditorBtn.addEventListener('click', clearTestEditor);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    state.user = null;
    state.isAdmin = false;
    els.loginScreen.classList.remove('hidden');
    els.mainScreen.classList.add('hidden');
    return;
  }

  state.user = user;
  state.isAdmin = await checkAdmin(user.uid);
  els.userBadge.textContent = `${user.email || user.uid}${state.isAdmin ? ' • מנהל' : ''}`;
  els.adminTabBtn.classList.toggle('hidden', !state.isAdmin);
  els.bootstrapAdminBox.classList.toggle('hidden', state.isAdmin);
  els.loginScreen.classList.add('hidden');
  els.mainScreen.classList.remove('hidden');
  await bootstrap();
});

async function loginUser() {
  try {
    els.authMessage.textContent = 'מתחבר...';
    await signInWithEmailAndPassword(auth, els.loginEmail.value.trim(), els.loginPassword.value);
    els.authMessage.textContent = '';
  } catch (err) {
    message(els.authMessage, friendlyError(err), true);
  }
}

async function registerUser() {
  try {
    els.authMessage.textContent = 'יוצר חשבון...';
    await createUserWithEmailAndPassword(auth, els.loginEmail.value.trim(), els.loginPassword.value);
    els.authMessage.textContent = 'המשתמש נוצר. לאחר ההתחברות אפשר ללחוץ על הכפתור להפעלת Admin לחשבון.';
  } catch (err) {
    message(els.authMessage, friendlyError(err), true);
  }
}

async function checkAdmin(uid) {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch (e) {
    console.error("Failed to fetch admin state:", e);
    return false;
  }
}

async function enableAdminForCurrentUser() {
  try {
    if (!state.user) return;
    els.bootstrapAdminMessage.textContent = 'מפעיל...';
    await setDoc(doc(db, 'admins', state.user.uid), {
      uid: state.user.uid,
      email: state.user.email || '',
      role: 'admin',
      createdAt: serverTimestamp()
    }, { merge: true });

    state.isAdmin = true;
    els.userBadge.textContent = `${state.user.email || state.user.uid} • מנהל`;
    els.adminTabBtn.classList.remove('hidden');
    els.bootstrapAdminBox.classList.add('hidden');
    await bootstrap();
    document.querySelector('[data-tab="adminTab"]').click();
  } catch (err) {
    message(els.bootstrapAdminMessage, friendlyError(err), true);
  }
}

async function bootstrap() {
  await Promise.all([loadSystemTypes(), loadTests()]);
  renderSystemTypesSelect();
  renderTestsTable();
  if (state.isAdmin) {
    await loadRecords();
    renderAdminLists();
  }
  if (!els.testDate.value) els.testDate.value = new Date().toISOString().slice(0, 10);
}

async function loadSystemTypes() {
  try {
    const snap = await getDocs(collection(db, 'systemTypes'));
    state.systemTypes = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'he'));
  } catch(e) { console.error('Failed systemTypes list', e); }
}

async function loadTests() {
  try {
    const snaps = await Promise.all([
      getDocs(collection(db, 'testDefinitions')).catch(e => { console.warn('No testDefinitions collection:', e); return { docs: [] }; }),
      getDocs(collection(db, 'tests')).catch(e => { console.warn('No tests collection:', e); return { docs: [] }; })
    ]);
    
    // Merge docs from both collections
    const allDocs = [...snaps[0].docs, ...snaps[1].docs];
    
    // Ensure uniqueness by ID in case they somehow duplicate
    const uniqueDocsMap = new Map();
    allDocs.forEach(d => uniqueDocsMap.set(d.id, d));
    
    state.tests = Array.from(uniqueDocsMap.values())
      .map(d => normalizeTest(d.id, d.data()))
      .filter(t => t.code || t.title)
      .sort(compareTests);
  } catch(e) { console.error('Failed testDefinitions list', e); }
}

function normalizeTest(id, data = {}) {
  // Backward compatibility: data.testNumber -> code, data.category -> section
  const code = String(data.code ?? data.testNumber ?? '').trim();
  const section = normalizeSection(data.section ?? data.category);
  return {
    id,
    ...data,
    code,
    section,
    equipmentType: String(data.equipmentType ?? '').trim(),
    title: String(data.title ?? '').trim(),
    method: String(data.method ?? data.description ?? '').trim(),
    active: data.active !== false
  };
}

function normalizeSection(value) {
  const v = String(value ?? '').trim();
  if (SECTION_ORDER.includes(v)) return v;
  if (v === 'מקרי קצה') return 'בדיקות מקרי קצה';
  return 'טרום בדיקה';
}

async function loadRecords() {
  try {
    const snap = await getDocs(collection(db, 'atpRecords'));
    state.records = snap.docs
      .map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          updatedAtText: formatDateTime(data.updatedAt),
          testDateText: data.testDate || ''
        };
      })
      .sort((a, b) => timestampMs(b.updatedAt) - timestampMs(a.updatedAt))
      .slice(0, 200);
  } catch(e) { console.error('Failed records list', e); }
}

function renderSystemTypesSelect() {
  els.systemTypeSelect.innerHTML = [
    '<option value="">בחר סוג מערכת</option>',
    ...state.systemTypes.map(t => `<option value="${escapeHtml(t.name)}">${escapeHtml(t.name)}</option>`)
  ].join('');
}

function renderTestsTable(existingResults = {}) {
  els.sectionsContainer.innerHTML = SECTION_ORDER.map(section => {
    const tests = state.tests.filter(t => t.active !== false && t.section === section);
    return `<section class="card glass section-card">
      <h3 class="section-badge">${section}</h3>
      <div class="test-cards-wrapper">
      ${tests.length ? tests.map(t => testRowHtml(t, existingResults[t.id] || existingResults[t.code] || null)).join('') : '<div class="muted">אין בדיקות בקטגוריה זו</div>'}
      </div></section>`;
  }).join('');
  bindStatusSelects();
}

function testRowHtml(test, result) {
  const status = result?.status || '';
  const note = result?.note || '';
  return `<div class="test-card" data-test-id="${test.id}" data-test-code="${escapeHtml(test.code)}">
    <div class="test-card-header">
      <div class="test-code-badge">${escapeHtml(test.code)}</div>
      <div class="test-title bold-title">${escapeHtml(test.title || '')}</div>
    </div>
    <div class="test-card-body">
      <div class="test-method dim">${escapeHtml(test.method || 'אין תיאור אופן בדיקה.')}</div>
      <div class="test-controls">
        <div class="status-wrapper">
          <label class="block-label">סטטוס מבדק</label>
          <select class="result-status ${statusClassName(status)}" aria-label="תוצאת בדיקה">
            ${STATUS_OPTIONS.map(opt => `<option value="${opt}" ${opt === status ? 'selected' : ''}>${statusIcon(opt)} ${escapeHtml(opt || 'בחר סטטוס')}</option>`).join('')}
          </select>
        </div>
        <div class="note-wrapper">
          <label class="block-label">הערות הבודק / ממצאים</label>
          <textarea class="result-note" rows="2" placeholder="פרט כאן כל עדות לכשל או התנהגות שאינה תואמת את הציפיות...">${escapeHtml(note)}</textarea>
        </div>
      </div>
    </div>
  </div>`;
}

function bindStatusSelects() {
  document.querySelectorAll('.result-status').forEach(select => {
    select.removeEventListener('change', handleStatusSelectChange);
    select.addEventListener('change', handleStatusSelectChange);
    applyStatusSelectClass(select);
  });
}

function handleStatusSelectChange(event) {
  applyStatusSelectClass(event.currentTarget);
}

function applyStatusSelectClass(select) {
  select.classList.remove('status-empty', 'status-pass', 'status-fail', 'status-na');
  select.classList.add(statusClassName(select.value));
}

function statusMeta(status) { return STATUS_META[status] || STATUS_META['']; }
function statusIcon(status) { return statusMeta(status).icon; }
function statusLabel(status) { return statusMeta(status).label; }
function statusClassName(status) { return statusMeta(status).className; }
function renderStatusChip(status) { return `<span class="status-chip ${escapeHtml(status)} ${status ? '' : 'empty'}" title="${escapeHtml(statusLabel(status))}">${escapeHtml(statusIcon(status))}</span>`; }

async function saveSystemType() {
  if (!state.isAdmin) return;
  const name = els.newSystemTypeName.value.trim();
  if (!name) return;
  try {
    els.saveSystemTypeBtn.disabled = true;
    await addDoc(collection(db, 'systemTypes'), { name, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: state.user.uid });
    els.newSystemTypeName.value = '';
    message(els.systemTypesMessage, 'סוג מערכת נוסף בהצלחה.');
    await loadSystemTypes();
    renderSystemTypesSelect();
    renderAdminLists();
  } catch (err) {
    message(els.systemTypesMessage, friendlyError(err), true);
  } finally {
    els.saveSystemTypeBtn.disabled = false;
  }
}

function renderAdminLists() {
  renderSystemTypesAdmin();
  renderTestsAdmin();
  renderRecordsTable();
}

function renderSystemTypesAdmin() {
  els.systemTypesList.innerHTML = state.systemTypes.map(item => `<div class="list-item"><div class="section-title-row"><div class="list-item-title">${escapeHtml(item.name)}</div><div class="actions compact"><button class="secondary edit-btn" data-action="rename-system-type" data-id="${item.id}">שנה שם</button><button class="danger-lite" data-action="delete-system-type" data-id="${item.id}">מחיקה</button></div></div></div>`).join('') || '<div class="muted">אין סוגי מערכות.</div>';

  els.systemTypesList.querySelectorAll('[data-action="rename-system-type"]').forEach(btn => btn.addEventListener('click', async () => {
    const current = state.systemTypes.find(x => x.id === btn.dataset.id);
    const name = prompt('שם חדש למערכת', current?.name || '');
    if (!name || name.trim() === '') return;
    try {
      await updateDoc(doc(db, 'systemTypes', btn.dataset.id), { name: name.trim(), updatedAt: serverTimestamp() });
      message(els.systemTypesMessage, 'שם המערכת עודכן.');
      await loadSystemTypes();
      renderSystemTypesSelect();
      renderAdminLists();
    } catch(err) { message(els.systemTypesMessage, friendlyError(err), true); }
  }));

  els.systemTypesList.querySelectorAll('[data-action="delete-system-type"]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('האם למחוק סוג מערכת זה? הפעולה לא תימחק רשומות קיימות, אך היא תעלם מהאפשרויות בטופס.')) return;
    try {
      await deleteDoc(doc(db, 'systemTypes', btn.dataset.id));
      message(els.systemTypesMessage, 'סוג המערכת נמחק.');
      await loadSystemTypes();
      renderSystemTypesSelect();
      renderAdminLists();
    } catch(err) { message(els.systemTypesMessage, friendlyError(err), true); }
  }));
}

function clearTestEditor() {
  state.editingTestId = null;
  els.testSectionInput.value = 'טרום בדיקה';
  els.testCodeInput.value = '';
  els.testEquipmentInput.value = '';
  els.testTitleInput.value = '';
  els.testMethodInput.value = '';
  els.saveTestBtn.textContent = 'הוסף בדיקה למאגר';
}

async function saveTestDefinition() {
  if (!state.isAdmin) return;
  const payload = {
    section: els.testSectionInput.value,
    code: els.testCodeInput.value.trim(),
    equipmentType: els.testEquipmentInput.value.trim(),
    title: els.testTitleInput.value.trim(),
    method: els.testMethodInput.value.trim(),
    active: true,
    updatedAt: serverTimestamp(),
    updatedBy: state.user.uid
  };
  
  if (!payload.code || !payload.title) {
    message(els.testsAdminMessage, 'יש למלא לפחות קוד וכותרת בדיקה!', true);
    return;
  }
  
  try {
    els.saveTestBtn.disabled = true;
    if (state.editingTestId) {
      await updateDoc(doc(db, 'testDefinitions', state.editingTestId), payload);
      message(els.testsAdminMessage, 'הבדיקה עודכנה בהצלחה במאגר.');
    } else {
      payload.createdAt = serverTimestamp();
      payload.createdBy = state.user.uid;
      await addDoc(collection(db, 'testDefinitions'), payload);
      message(els.testsAdminMessage, 'הבדיקה נוצרה והתווספה למאגר.');
    }
    clearTestEditor();
    await loadTests();
    renderTestsTable();
    renderAdminLists();
  } catch(err) {
    message(els.testsAdminMessage, friendlyError(err), true);
  } finally {
    els.saveTestBtn.disabled = false;
  }
}

function renderTestsAdmin() {
  els.testsAdminList.innerHTML = SECTION_ORDER.map(section => {
    const tests = state.tests.filter(t => t.section === section);
    return `<div class="list-item section-block"><div class="list-item-title bold-title">${section} <span class="pill">${tests.length}</span></div><div class="list">${tests.map(t => `<div class="list-item inner-item"><div class="section-title-row"><div><div class="test-row-header"><strong>${escapeHtml(t.code)}</strong> — ${escapeHtml(t.title)}</div><small class="dim">${escapeHtml(t.equipmentType || '')}</small><div class="muted details">${escapeHtml(t.method || '')}</div></div><div class="actions compact"><button class="secondary edit-btn" data-action="edit-test" data-id="${t.id}">ערוך</button><button class="danger-lite" data-action="delete-test" data-id="${t.id}">מחק</button></div></div></div>`).join('') || '<div class="muted">אין בדיקות ספציפיות בקטגוריה זו.</div>'}</div></div>`;
  }).join('');

  els.testsAdminList.querySelectorAll('[data-action="edit-test"]').forEach(btn => btn.addEventListener('click', () => {
    const test = state.tests.find(t => t.id === btn.dataset.id);
    if (!test) return;
    state.editingTestId = test.id;
    els.testSectionInput.value = test.section || 'טרום בדיקה';
    els.testCodeInput.value = test.code || '';
    els.testEquipmentInput.value = test.equipmentType || '';
    els.testTitleInput.value = test.title || '';
    els.testMethodInput.value = test.method || '';
    els.saveTestBtn.textContent = 'שמור שינויים בבדיקה';
    
    // Smooth scroll to the editor pane
    document.getElementById('testsManagerCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    els.testCodeInput.focus();
  }));

  els.testsAdminList.querySelectorAll('[data-action="delete-test"]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק בדיקה זו לצמיתות?')) return;
    try {
      await deleteDoc(doc(db, 'testDefinitions', btn.dataset.id));
      message(els.testsAdminMessage, 'הבדיקה הוסרה מהמאגר בהצלחה.');
      
      // If we deleted the test we were currently editing, clear the editor so updates don't crash
      if (state.editingTestId === btn.dataset.id) {
        clearTestEditor();
      }

      await loadTests();
      renderTestsTable();
      renderAdminLists();
    } catch(err) {
      console.error(err);
      message(els.testsAdminMessage, friendlyError(err), true);
    }
  }));
}

async function loadDefaultTests() {
  if (!state.isAdmin) return;
  if (!confirm('פעולה זו תמלא את המאגר בבדיקות ברירת המחדל (אם הן לא קיימות כבר). להמשיך?')) return;
  try {
    els.loadDefaultsBtn.disabled = true;
    const existing = new Set(state.tests.map(t => `${t.section}|${t.code}|${t.title}`));
    let count = 0;
    for (const test of DEFAULT_TESTS) {
      const key = `${test.section}|${test.code}|${test.title}`;
      if (existing.has(key)) continue;
      await addDoc(collection(db, 'testDefinitions'), { ...test, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), createdBy: state.user.uid, updatedBy: state.user.uid });
      count++;
    }
    await loadTests();
    renderTestsTable();
    renderAdminLists();
    message(els.testsAdminMessage, `התווספו ${count} בדיקות שמורות מראש למערכת.`);
  } catch(err) {
    message(els.testsAdminMessage, friendlyError(err), true);
  } finally {
    els.loadDefaultsBtn.disabled = false;
  }
}

function collectResultsFromForm() {
  return [...document.querySelectorAll('#sectionsContainer .test-card[data-test-id]')].map(row => ({
    testId: row.dataset.testId,
    code: row.dataset.testCode,
    status: row.querySelector('.result-status')?.value || '',
    note: row.querySelector('.result-note')?.value || ''
  }));
}

function summarizeRecord(results) {
  const counts = { passed: 0, failed: 0, na: 0, empty: 0 };
  for (const r of results) {
    if (r.status === 'עבר') counts.passed++;
    else if (r.status === 'נכשל') counts.failed++;
    else if (r.status === 'לא רלוונטי') counts.na++;
    else counts.empty++;
  }
  let overall = 'לא הושלם';
  if (counts.failed > 0) overall = 'נכשל';
  else if (counts.passed > 0 && counts.empty === 0) overall = 'עבר';
  else if (counts.passed > 0) overall = 'חלקי';
  return { counts, overall };
}

function buildRecordPayload() {
  const results = collectResultsFromForm();
  return {
    testerName: els.testerName.value.trim(),
    testDate: els.testDate.value,
    location: els.location.value.trim(),
    stationId: els.stationId.value.trim(),
    platformId: els.platformId.value.trim(),
    systemType: els.systemTypeSelect.value,
    generalNotes: els.generalNotes.value.trim(),
    results,
    ownerUid: state.user.uid,
    ownerEmail: state.user.email || '',
    updatedAt: serverTimestamp(),
    updatedBy: state.user.uid,
    summary: summarizeRecord(results)
  };
}

async function persistRecord({ isDraft }) {
  const payload = buildRecordPayload();
  if (!isDraft && (!payload.platformId || !payload.testDate || !payload.systemType || !payload.testerName)) {
    throw new Error('missing-required');
  }
  payload.isDraft = !!isDraft;
  if (state.currentRecordId) {
    await updateDoc(doc(db, 'atpRecords', state.currentRecordId), payload);
    return state.currentRecordId;
  }
  payload.createdAt = serverTimestamp();
  payload.createdBy = state.user.uid;
  const ref = await addDoc(collection(db, 'atpRecords'), payload);
  state.currentRecordId = ref.id;
  return ref.id;
}

async function saveCurrentRecord() {
  try {
    els.saveRecordBtn.disabled = true;
    els.saveRecordBtn.textContent = 'שומר...';
    const recordId = await persistRecord({ isDraft: false });
    if (!recordId) return;
    message(els.saveMessage, `הטופס נשמר סופית! תוצאה כוללת למעקב: ${summarizeRecord(collectResultsFromForm()).overall}`);
    if (state.isAdmin) {
      await loadRecords();
      renderRecordsTable();
    }
  } catch (err) {
    if(err.message === 'missing-required') {
      message(els.saveMessage, 'שגיאה: לפני שמירה סופית יש למלא לפחות בודק, תאריך, רחפן וסוג מערכת ברמת החובה.', true);
    } else {
      message(els.saveMessage, friendlyError(err), true);
    }
  } finally {
    els.saveRecordBtn.disabled = false;
    els.saveRecordBtn.textContent = 'שמירה סופית';
  }
}

async function saveDraftRecord() {
  try {
    els.saveDraftBtn.disabled = true;
    const recordId = await persistRecord({ isDraft: true });
    if (!recordId) return;
    message(els.saveMessage, 'טיוטת הבדיקה נשמרה בבטחה. ניתן להמשיך להזין נתונים במועד מאוחר יותר.');
    if (state.isAdmin) {
      await loadRecords();
      renderRecordsTable();
    }
  } catch (err) {
    message(els.saveMessage, friendlyError(err), true);
  } finally {
    els.saveDraftBtn.disabled = false;
  }
}

async function loadLatestDraft() {
  try {
    els.loadDraftBtn.disabled = true;
    const snap = await getDocs(collection(db, 'atpRecords'));
    const drafts = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.ownerUid === state.user?.uid && r.isDraft);
    if (!drafts.length) {
      message(els.saveMessage, 'לא נמצאה טיוטה קודמת תחת החשבון המחובר.', true);
      return;
    }
    // Most recent draft
    drafts.sort((a, b) => timestampMs(b.updatedAt) - timestampMs(a.updatedAt));
    loadRecordObjectIntoForm(drafts[0]);
    message(els.saveMessage, 'הטיוטה האחרונה ששמרת שוחזרה בהצלחה לטופס.');
  } catch (err) {
    message(els.saveMessage, friendlyError(err), true);
  } finally {
    els.loadDraftBtn.disabled = false;
  }
}

function resetForm() {
  if(!confirm("האם אתה בטוח שברצונך לפתוח טופס חדש? נתונים שלא נשמרו בדף אולי ימחקו.")) return;
  state.currentRecordId = null;
  els.testerName.value = '';
  els.testDate.value = new Date().toISOString().slice(0, 10);
  els.location.value = '';
  els.stationId.value = '';
  els.platformId.value = '';
  els.systemTypeSelect.value = '';
  els.generalNotes.value = '';
  els.saveMessage.textContent = '';
  renderTestsTable();
}

function renderRecordsTable() {
  els.recordsTableBody.innerHTML = state.records.map(record => {
    const overall = record.isDraft ? 'טיוטה' : (record.summary?.overall || 'ללא נתונים');
    const resultClass = record.isDraft ? 'record-result-draft' : overall === 'עבר' ? 'record-result-good' : overall === 'נכשל' ? 'record-result-bad' : 'record-result-warn';
    return `<tr class="fade-in"><td><strong>${escapeHtml(record.platformId || '')}</strong></td><td>${escapeHtml(record.systemType || '')}</td><td>${escapeHtml(record.testDateText || '')}</td><td>${escapeHtml(record.testerName || '')}</td><td class="${resultClass}">${escapeHtml(overall)}</td><td>${escapeHtml(record.updatedAtText || '')}</td><td><div class="actions compact"><button class="secondary" data-action="view-record" data-id="${record.id}">צפייה</button><button class="secondary edit-btn" data-action="edit-record" data-id="${record.id}">ערוך</button><button class="danger-lite" data-action="delete-record" data-id="${record.id}">מחק</button></div></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="text-center muted">כרגע אין שום רשומות במערכת.</td></tr>';

  els.recordsTableBody.querySelectorAll('[data-action="view-record"]').forEach(btn => btn.addEventListener('click', () => openRecordModal(btn.dataset.id)));
  els.recordsTableBody.querySelectorAll('[data-action="edit-record"]').forEach(btn => btn.addEventListener('click', () => loadRecordIntoForm(btn.dataset.id)));
  
  els.recordsTableBody.querySelectorAll('[data-action="delete-record"]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('אזהרה: האם למחוק את רשומת הבדיקה הזו לצמיתות?')) return;
    try {
      await deleteDoc(doc(db, 'atpRecords', btn.dataset.id));
      message(els.recordsAdminMessage, 'רשומת הבדיקה הוסרה מהמערכת בהצלחה.');
      await loadRecords();
      renderRecordsTable();
    } catch (err) {
      message(els.recordsAdminMessage, friendlyError(err), true);
    }
  }));
}

async function openRecordModal(recordId) {
  const record = state.records.find(r => r.id === recordId);
  if (!record) return;
  els.modalTitle.textContent = `רשומת בדיקה מלאה: פלטפורמה ${record.platformId || 'לא ידוע'}`;
  const resultsMap = Object.fromEntries((record.results || []).map(r => [r.testId || r.code, r]));
  els.modalContent.innerHTML = `<div class="summary-grid">${renderKv('שם הבודק', record.testerName)}${renderKv('תאריך הניסוי', record.testDate)}${renderKv('מספר פלטפורמה', record.platformId)}${renderKv('תצורת מערכת', record.systemType)}${renderKv('זיהוי תחנה', record.stationId)}${renderKv('מיקום ניסוי', record.location)}${renderKv('סטטוס מסכם', record.summary?.overall || '')}${renderKv('הערות הניסוי בשלמותן', record.generalNotes || '')}</div>` +
  SECTION_ORDER.map(section => {
    const tests = state.tests.filter(t => t.section === section);
    return `<section class="card glass section-card modal-section"><h3>${section}</h3><div class="table-wrap"><table class="test-table"><thead><tr><th>סימול</th><th>בדיקה נדרשת</th><th>סטטוס</th><th>הערות לחריגה</th></tr></thead><tbody>${tests.map(t => {
      const r = resultsMap[t.id] || resultsMap[t.code] || {};
      return `<tr><td><b>${escapeHtml(t.code)}</b></td><td>${escapeHtml(t.title)}</td><td>${renderStatusChip(r.status || '')}</td><td>${escapeHtml(r.note || '')}</td></tr>`;
    }).join('')}</tbody></table></div></section>`;
  }).join('');
  els.modalOverlay.classList.remove('hidden');
}

function renderKv(label, value) {
  return `<div class="kv"><strong>${escapeHtml(label)}</strong><div class="muted">${escapeHtml(value || 'ריק')}</div></div>`;
}

async function loadRecordIntoForm(recordId) {
  const record = state.records.find(r => r.id === recordId);
  if (!record) return;
  loadRecordObjectIntoForm(record);
}

function loadRecordObjectIntoForm(record) {
  state.currentRecordId = record.id;
  els.testerName.value = record.testerName || '';
  els.testDate.value = record.testDate || '';
  els.location.value = record.location || '';
  els.stationId.value = record.stationId || '';
  els.platformId.value = record.platformId || '';
  els.systemTypeSelect.value = record.systemType || '';
  els.generalNotes.value = record.generalNotes || '';
  const resultsMap = Object.fromEntries((record.results || []).map(r => [r.testId || r.code, r]));
  renderTestsTable(resultsMap);
  document.querySelector('[data-tab="formTab"]').click();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function timestampMs(ts) {
  return ts && typeof ts.toDate === 'function' ? ts.toDate().getTime() : 0;
}

function compareTests(a, b) {
  const sectionIndex = s => {
    const i = SECTION_ORDER.indexOf(s);
    return i === -1 ? 99 : i;
  }
  const s = sectionIndex(a.section) - sectionIndex(b.section);
  if (s !== 0) return s;
  return String(a.code || '').localeCompare(String(b.code || ''), 'en', { numeric: true, sensitivity: 'base' });
}

function formatDateTime(ts) {
  return ts && typeof ts.toDate === 'function' ? ts.toDate().toLocaleString('he-IL') : '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function friendlyError(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential')) return 'שגיאה: פרטי ההתחברות שגויים או משתמש חסר.';
  if (code.includes('email-already-in-use')) return 'האימייל הזה כבר תפוס במערכת.';
  if (code.includes('weak-password')) return 'אנא בחר סיסמה חזקה יותר (לפחות 6 תווים).';
  if (code.includes('permission-denied')) return 'הפעולה נדחתה. אין לך את ההרשאות המתאימות (חוקי ה-Firestore חסמו זאת).';
  return err?.message || 'אירעה שגיאה. בדוק חיבור לאינטרנט ונסה שוב.';
}
