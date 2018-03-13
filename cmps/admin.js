import surveyService from '../services/surveyService.js' 

export default {
    template: `
    <section>
        <h2>מסך אדמין</h2>
        <div class="admin-control">
            <router-link to='/' tag="button" class="admin-btn btn-grey">נבדק חדש</router-link>
            <button @click="saveData" class="admin-btn btn-green">שמור מידע למחשב</button>
            <button @click = "setPromoTimer" class="admin-btn btn-blue">קבע טיימר חיסור</button>
            <button @click = "setTaskTimer" class="admin-btn btn-blue">קבע טיימר משימות</button>
            <button @click="clearStorage" class="admin-btn btn-red">איתחול ניסוי</button>
        </div>
        </br>
        <div class="admin-statistics">
            <h2>נתונים סטטיסטיים</h2>
            <div v-if="!rawData">
                <p>אין נתונים להצגה</p>
            </div>
            <div v-else class="stat-section">
                <div class="generalStat stat-div">
                    <h4>כללי:</h4>
                    <p>סך הכל נבדקים: {{rawData.length}}</p>
                    <p>מספר נבדקים במסלול לחץ: {{numOfStress}}</p>
                    <p>מספר נבדקים במסלול לא-לחץ: {{rawData.length - numOfStress}}</p>
                </div>
                <div class="coinsStat stat-div">
                    <h4>משימת המטבעות:</h4>
                    <p>אחוז הנבדקים שפתר בהצלחה: {{coinsSuccessRate}}%</p>
                    <p>זמן הפתרון הארוך ביותר: {{coinsMax}}ms</p>
                    <p>זמן הפתרון הקצר ביותר: {{coinsMin}}ms</p>
                    <p>זמן הפתרון הממוצע: {{coinsAvg}}ms</p>
                </div>
                <div class="matchStat stat-div">
                    <h4>משימת הגפרורים:</h4>
                    <p>אחוז הנבדקים שפתר בהצלחה: {{matchSuccessRate}}%</p>
                    <p>זמן הפתרון הארוך ביותר: {{matchMax}}ms</p>
                    <p>זמן הפתרון הקצר ביותר: {{matchMin}}ms</p>
                    <p>זמן הפתרון הממוצע: {{matchAvg}}ms</p>
                </div>
            </div>
        </div>
    </section>
    `,
    data() {
        return {
            // rawData: surveyService.getDataFromStorage()
            coinsMin: Infinity,
            coinsMax: 0,
            coinsAvg: 0,
            coinsSuccessRate: 0,
            matchMin: Infinity,
            matchMax: 0,
            matchAvg: 0,
            matchSuccessRate: 0,
        }
    },
    methods: {
        clearStorage() {
            if (confirm('האם את/ה בטוח/ה? פעולה זו בילתי הפיכה.\nהמידע שימחק כולל את נתוני הניסוי וזמן טיימר.\nאנא וודא/י גיבוי של המידע לפני אישור.')) {
                surveyService.clearLocalStorage();
                location.reload();
            } else {
                return;
            }
        },
        saveData() {
            var fileName = new Date().toLocaleString('en-GB') + ' export.csv'
            // console.log('file name:', fileName)
            surveyService.exportToCsv(fileName)
        },
        setPromoTimer() {
            surveyService.setPromoTimer();
        },
        setTaskTimer() {
            surveyService.setTaskTimer();
        },
        taskTimeStat() {
            var coinsTotal = 0;
            var coinsSuccess = 0;
            var matchTotal = 0;
            var matchSuccess = 0;

            this.rawData.forEach(subject => {
                if (subject.coinsTaskSolved) {
                    coinsSuccess++;
                    if (subject.coinsTaskTimeToSolution < this.coinsMin) {
                        this.coinsMin = subject.coinsTaskTimeToSolution;
                    };
                    if (subject.coinsTaskTimeToSolution > this.coinsMax) {
                        this.coinsMax = subject.coinsTaskTimeToSolution;
                    };
                    coinsTotal += subject.coinsTaskTimeToSolution;
                }
                if (subject.matchTaskSolved) {
                    matchSuccess++;
                    if (subject.matchTaskTimeToSolution < this.matchMin) {
                        this.matchMin = subject.matchTaskTimeToSolution;
                    };
                    if (subject.matchTaskTimeToSolution > this.matchMax) {
                        this.matchMax = subject.matchTaskTimeToSolution;
                    };
                    matchTotal += subject.matchTaskTimeToSolution;
                }
            });
            this.coinsAvg = coinsTotal / coinsSuccess;
            this.coinsSuccessRate = ((coinsSuccess / this.rawData.length) * 100)
            this.matchAvg = matchTotal / matchSuccess;
            this.matchSuccessRate = ((matchSuccess / this.rawData.length) * 100)
        }
    },
    computed: {
        rawData() {
            return surveyService.getDataFromStorage();
        },
        numOfStress() {
            var count = 0;
            this.rawData.forEach(subject => {
                if (subject.shouldStress) count++;
            })
            return count;
        },
    },
    created() {
        surveyService.getAuth();
        // surveyService.initExp();
    },
    mounted() {
        if (this.rawData) {
            this.taskTimeStat();
        }
    }
}