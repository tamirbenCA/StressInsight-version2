import surveyService from '../services/surveyService.js'

// <table @drop="drop" @dragover="allowDrop">
export default {
    template: `
    <section>
        <div v-if="taskState==='task-show'">
            <p>לפניך 10 מטבעות היוצרים משולש שווה צלעות שראשו כלפי מעלה.<p>
            <p>כאשר ידיך נשארות במקום, נסה לדמיין הזזת שלושה מטבעות בלבד כך שהמשולש יתהפך ויפנה כלפי מטה.</p>
            <p>לא ניתן להרים מטבע. יש לגרור אותו כך שלא ייגע במטבעות אחרים.</p>
            <p>בכל מהלך ניתן להזיז רק מטבע אחד. סך הכל ישנם שלושה מהלכים.</p>
            <p>כאשר אתה חושב שהצלחת, לחץ על כפתור "פתרתי"</p>
        </div>
        <div>
            <p v-if="taskState==='task-play'">פתור את התרגיל ע"י גרירת שלושת המטבעות עם העכבר.</p>
            <table id="coin-table" @drop="drop" @dragover="allowDrop" v-if="shouldShowTable">
                <tr v-for="(row, i) in rows" v-if="showRow(i)">
                    <td v-for="(col, j) in cols" :class="setClassName(i, j)">
                        <img v-if="deployCoins(i, j)" src="img/coin.png" :id="setImgId(i, j)" class="coin-png" draggable="true" @dragstart="drag"/>
                    </td>
                </tr>
            </table>
        </div>
        <div v-if="taskState==='task-show'">
            <input type="submit" value="פתרתי" @click=solveTask />
        </div>
        <div v-if="taskState==='task-how'" class="task-how">
            <form @submit.prevent="submitReport">
                <p>אנשים הפותרים חידה זו פותרים אותה באחת משתי הדרכים המתוארות:</p>
                <div class="radio-btns">
                    <div>
                        <input type="radio" v-model="selfReport" name="selfReport" value="insight" id="insight" required>
                        <label for="insight">לאחר מספר ניסיונות לפתור, הייתה תחושה של מבוי סתום ותקיעות. לא ניתן היה להתקדם לעבר הפתרון. ואז פתאום, התשובה צצה "משום מקום".</label>
                    </div>
                    <div>
                        <input type="radio" v-model="selfReport" name="selfReport" value="progress" id="progress">
                        <label for="progress">הייתה תחושה של התקרבות לפתרון, ההתקדמות הייתה הדרגתית עד להגעה לפתרון. לא הייתה שום תחושת הפתעה או גילוי.</label>
                    </div>
                </div>
                <div>
                    <p>תאר בקצרה את הרגשתך כעת:</p>
                    <textarea v-model="comment" cols="60" rows="3" required></textarea>
                </div>
                <input type="submit" value="המשך">
            </form>
        </div>
    </section>
    `,
    data() {
        return {
            rows: 8,
            cols: 15,
            coins: {
                    '2-7': true ,
                    '3-6': true,
                    '3-8': true,
                    '4-5': true,
                    '4-7': true,
                    '4-9': true,
                    '5-4': true,
                    '5-6': true,
                    '5-8': true,
                    '5-10': true 
                    },
            taskState: 'task-show',
            moveCount: 0,
            startTime: null,
            endTime: null,
            solved: null,
            selfReport: null,
            comment: null,
            timer: surveyService.getTaskTimer(),
            timeOut: null
        }
    },
    computed: {
        shouldShowTable() {
            if (this.taskState === 'task-show' || this.taskState === 'task-play') {
                return true;
            }
        }
    },
    methods: {
        submitReport() {
            this.taskState = 'task-play'
        },
        showRow(i) {
            if (this.taskState === 'task-play') return true;
            if (i > 1 && i < 6)
                return true;
        },
        setClassName(i, j) {
            return 'cell-' + i + '-' + j;
        },
        setImgId(i, j) {
          return 'img-' + i + '-' + j;  
        },
        deployCoins(i, j) {
            var position = i.toString() + '-' + j.toString();
            if (this.coins[position]) {
                return true;
          }
        },
        endTask() {
            var cell1 = document.querySelector('.cell-3-4 > img');
            var cell2 = document.querySelector('.cell-3-10 > img');
            var cell3 = document.querySelector('.cell-6-7 > img');

            if (cell1 && cell2 && cell3) {
                this.solved = true;
            } else {
                this.solved = false;
            }

            var taskRes = { 
                moveCount: this.moveCount,
                startTime: this.startTime,
                endTime: this.endTime,
                // timeToSolution: this.endTime - this.startTime,
                solved: this.solved,
                selfReport: this.selfReport,
                comment: this.comment
            }

            if (taskRes.timeToSolution < 0) {
                taskRes.timeToSolution = null;
            }

            surveyService.setCoinsTask(taskRes)
            setTimeout(_ => { this.$router.push('/sticktask')},3000);
        },
        solveTask() {
            clearTimeout(this.timeOut);
            this.endTime = Date.now();
            this.taskState = 'task-how'
        },
        allowDrop(ev) {
            ev.preventDefault();
        },
        drag(ev) {
            if (this.taskState !== 'task-play' || this.moveCount === 3) return;
            ev.dataTransfer.setData("text/html", ev.target.id);
        },
        drop(ev) {
            if (this.taskState !== 'task-play' || this.moveCount === 3) return;
            ev.preventDefault();
            var data = ev.dataTransfer.getData("text/html");
            ev.target.appendChild(document.getElementById(data));
            this.moveCount++;
            if (this.moveCount === 3) {
                this.endTask();
            }
        }
    },
    mounted() {
        this.timeOut = setTimeout(this.endTask, this.timer)
        this.startTime = Date.now();
    },
    created() {
        if (!surveyService.isCurrUser()) {
            this.$router.push('/');
        }
    }
}