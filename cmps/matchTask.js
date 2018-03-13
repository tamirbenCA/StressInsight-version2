import surveyService from '../services/surveyService.js'

export default {
    template: `
    <section>
        <div v-if="taskState==='task-show'">
            <p>לפניך 10 גפרורים היוצרים משפט שקר חשבוני.<p>
            <p>כאשר ידיך נשארות במקום, נסה לדמיין הזזת גפרור אחד בלבד כך שהמשפט ההתחלתי יהפוך למשפט אמת חשבוני.</p>
            <p>את המגפרור ניתן להזיז למקום חדש בתוך המשוואה, לא ניתן לסובב אותו.</p>
            <p>גפרור אחד בלבד יכול לזוז.</p>
            <p>לא ניתן להיפטר מגפרור, כלומר אין להוציא אותו לגמרי מהמשוואה, מותר רק לשנות מיקום של גפרור.</p>
            <p>התוצאה חייבת להיות נכונה מבחינה חשבונית.</p>
            <p>כאשר אתה חושב שהצלחת, לחץ על כפתור "פתרתי"</p>
        </div>
        <div>
            <p v-if="taskState==='task-play'">פתור את התרגיל ע"י גרירת גפרור אחד עם העכבר.</p>
            <table id="match-table" @drop="drop" @dragover="allowDrop"  v-if="shouldShowTable">
                <tr>
                    <td :class="setClassName(0, 0)" style="textAlign:center">
                        <img src="img/match.png" :id="setImgId(0, 0)" class="match-png" draggable="true" @dragstart="drag"/>
                    </td>
                    <td :class="setClassName(0, 1)" style="textAlign:center">
                        <img src="img/match.png" :id="setImgId(1, 0)" class="match-png" style="transform:rotate(90deg)" draggable="true" @dragstart="drag"/>
                    </td>
                    <td :class="setClassName(0, 2)" style="textAlign:center">
                        <img src="img/match.png" :id="setImgId(2, 0)" class="match-png" draggable="true" @dragstart="drag"/>
                        <img src="img/match.png" :id="setImgId(2, 1)" class="match-png" draggable="true" @dragstart="drag"/>
                        <img src="img/match.png" :id="setImgId(2, 2)" class="match-png" draggable="true" @dragstart="drag"/>
                    </td>
                    <td :class="setClassName(0, 3)" style="textAlign:center">
                        <img src="img/match.png" :id="setImgId(3, 1)" class="match-png" style="transform:rotate(90deg)" draggable="true" @dragstart="drag"/>
                        <img src="img/match.png" :id="setImgId(3, 0)" class="match-png" style="transform:rotate(90deg); paddingBottom:20px" draggable="true" @dragstart="drag"/>
                    </td>
                    <td :class="setClassName(0, 4)" style="textAlign:center">
                        <img src="img/match.png" :id="setImgId(3, 1)" class="match-png" style="transform:rotate(10deg)" draggable="true" @dragstart="drag"/>
                        <img src="img/match.png" :id="setImgId(3, 0)" class="match-png" style="transform:rotate(160deg)" draggable="true" @dragstart="drag"/>                        
                    </td>
                    <td :class="setClassName(0, 5)" style="textAlign:right">
                        <img src="img/match.png" :id="setImgId(5, 0)" class="match-png" style="marginRight:-10px" draggable="true" @dragstart="drag"/>
                    </td>
                </tr>
            </table>
        </div>
        </br>
        <button class="roman-btn" :class="showRomanBtn" @click="displayRomanNums">הצג סרגל ספרות רומיות</button>
        <div :class="showRomanNums">
            <h1> סרגל ספרות רומיות </h1>
            <p class="roman-nums">1. I; 2. II; 3. III; 4. IV; 5. V; 6. VI</p>
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
            taskState: 'task-show',
            moveCount: 0,
            startTime: null,
            endTime: null,
            solved: null,
            selfReport: null,
            comment: null,
            timer: surveyService.getTaskTimer(),
            timeOut: null,
            timeInterval: null,
            msgDisplay: false
        }
    },
    computed: {
        showRomanNums() {
            if (this.msgDisplay) {
                return 'show-roman-nums'
            } else {
                return 'hide-roman-nums'
            }
        },
        showRomanBtn() {
            if (!this.msgDisplay) {
                return 'show-roman-nums'
            } else {
                return 'hide-roman-nums'
            }
        },
        shouldShowTable() {
            if (this.taskState === 'task-show' || this.taskState === 'task-play') {
                return true;
            }
        },
    },
    methods: {
        displayRomanNums() {
            clearTimeout(this.timeInterval);
            this.msgDisplay = true;
            this.timeInterval = setTimeout(_ => { 
                this.msgDisplay = false;
            }, 3000)
        },
        submitReport() {
            this.taskState = 'task-play'
        },
        setClassName(i, j) {
            return 'cell-' + i + '-' + j;
        },
        setImgId(i, j) {
          return 'img-' + i + '-' + j;  
        },
        
        endTask() {
            var cell1 = document.querySelector('.cell-0-1').childElementCount;
            var cell2 = document.querySelector('.cell-0-3').childElementCount;

            if (cell1 === 2 && cell2 === 1) {
                this.solved = true;
            } else {
                this.solved = false;
            }

            var taskRes = { 
                moveCount: this.moveCount,
                timeToSolution: this.endTime - this.startTime,
                solved: this.solved,
                selfReport: this.selfReport,
                comment: this.comment
            }

            if (taskRes.timeToSolution < 0) {
                taskRes.timeToSolution = null;
            }

            surveyService.setMatchTask(taskRes)
            setTimeout(_ => { this.$router.push('/thankyou')},3000);
        },
        solveTask() {
            clearTimeout(this.timeOut);
            this.endTime = Date.now();
            this.taskState = 'task-how';
        },
        allowDrop(ev) {
            ev.preventDefault();
        },
        drag(ev) {
            if (this.taskState !== 'task-play' || this.moveCount === 1) return;
            ev.dataTransfer.setData("text/html", ev.target.id);
        },
        drop(ev) {
            if (this.taskState !== 'task-play' || this.moveCount === 1) return;
            ev.preventDefault();
            var data = ev.dataTransfer.getData("text/html");
            ev.target.appendChild(document.getElementById(data));
            this.moveCount++;
            if (this.moveCount === 1) {
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