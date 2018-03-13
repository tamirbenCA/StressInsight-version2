import surveyService from '../services/surveyService.js';
import timerBar from './timerBar.js';

export default {
    template: `
    <section>
        <form v-if="promoState==='promo-show'" @submit.prevent="startPromo">
            <p>מיד יופיע מספר ממנו יש להחסיר {{numInterval}}.</p>
            <p>מהתוצאה יש להחסיר שוב {{numInterval}}.</p>
            <p>ומן התוצאה הזו יש להחסיר שוב {{numInterval}}.</p>
            <p>וכך הלאה...</p>
            <p>לאחר כל חיסור אתה מתבקש להקליד את התוצאה.</p>
            <p>מיד עם סיום ההקלדה התוצאה תעלם.</p>
            <p>עליך לזכור את התוצאה ולהמשיך להחסיר ממנה.</p>
            <p v-if="numInterval === 17"><b>במידה והתוצאה אינה נכונה יופיע <span class="span-x">X</span> ויש לחסר שוב מההתחלה (כלומר 1000).</b></p>
            <p><b>מטרת המשימה היא להתקדם עד לתוצאה הקטנה ביותר האפשרית לפני תום הזמן.</b></p>
            <input type="submit" value="המשך" />
        </form>
        <div v-else class="promo-main">
            <timer-bar :timer=timer></timer-bar>
            <div :class="showMsg">
                <h1> {{ msg }} </h1>
            </div>
            <form @submit.prevent="nextStep">
                <input type="number" v-model="userInput" required autofocus />
                <input type="submit" value="אישור" />
            </form>
            <div v-if="numInterval===17 && promoState!=='promo-start'" :class="showMsg" class="error-display">
                <img src="img/redx.png" class="x-img" />
            </div>                
        </div>
    </section>
    `,
    data() {
        return {
            promoState: 'promo-show',
            errorCount: 0,
            startTime: null,
            endTime: null,
            currNum: 1000,
            timer: this.setTimer(),
            numInterval: null,
            timeInterval: null,
            userInput: null,
            msgDisplay: null,
            msg: null
        }
    },
    components: {
        timerBar
    },
    computed: {
        showMsg() {
            if (this.promoState !== 'promo-show' && this.msgDisplay) {
                return 'show-number'
            } else {
                return 'hide-number'
            }
        }
    },
    methods: {
        setTimer() {
            return surveyService.getPromoTimer();
        },
        startPromo() {
            this.promoState = 'promo-start';
            this.startTime = Date.now();
            setTimeout(this.endPromo, this.timer);
            this.displayMsg(1000);
        },
        displayMsg(msg) {
            clearTimeout(this.timeInterval)
            this.msg = msg
            this.msgDisplay = true;
            this.timeInterval = setTimeout(_ => { 
                this.msgDisplay = false; 
            }, 3000)  
        },
        nextStep() {
            if (this.currNum === (+this.userInput + this.numInterval)) {
                clearTimeout(this.timeInterval)
                this.msgDisplay = false; 
                this.promoState = 'correct';
                this.currNum = +this.userInput;
                this.userInput = null;
            } else {
                if (this.numInterval === 17) {
                    this.errorCount++;
                    this.promoState = 'wrong';
                    this.displayMsg('חסר מחדש, החל מ-1000')
                    this.userInput = null;
                    this.currNum = 1000;
                }
                else {
                    if (this.userInput.length !== 3) {
                        this.promoState = 'wrong';
                        this.displayMsg('יש להכניס מספר בן 3 ספרות');
                        this.userInput = null;
                    } else {
                        clearTimeout(this.timeInterval)
                        this.msgDisplay = false;
                        this.promoState = 'correct';
                        this.errorCount++;
                        this.currNum = +this.userInput;
                        this.userInput = null;
                    }
                }
            }
        },
        endPromo() {
            this.endTime = Date.now();
            var promoRes = {
                startTime: this.startTime,
                endTime: this.endTime,
                errorCount: this.errorCount
            }
            surveyService.setPromo(promoRes);
            this.$router.push('/coinstask')
        }
    },
    created() {
        if (!surveyService.isCurrUser()) {
            this.$router.push('/');
        }
        if (surveyService.isCurrUserStress()) {
            this.numInterval = 17;
        } else {
            this.numInterval = 1;
        }
    }
}