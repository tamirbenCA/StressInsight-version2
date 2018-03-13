import surveyService from '../services/surveyService.js'

export default {
    template: `
        <section class="home-page">
            <div>
                <h2>ברוכים הבאים לניסוי פתרון בעיות</h2>
                <h2>תודה על השתתפותכם</h2>
            </div>
            <form  id="user-form" @submit.prevent="startTest">
                <div>
                    <h4>אנא הזן שם פרטי</h4>
                    <input type="text" v-model="name" required autofocus></input>
                </div>
                <div>
                    <h4>אנא הזן שנת לידה</h4>
                    <input type="number" v-model="yob" required></input>        
                </div>
                <div>
                    <div class="gender-picker">
                        <div>
                            <input type="radio" v-model="gender" name="gender" value="זכר" id="male" required>
                            <label for="male">בן</label>
                        </div>
                        <div>
                            <input type="radio" v-model="gender" name="gender" value="נקבה" id="female">
                            <label for="female">בת</label>
                        </div>
                    </div>
                </div>
                <input type="submit" value="התחל" />
            </form>
            <h5>השאלות מנוסחות בלשון זכר אולם פונות לשני המינים</h5>
    </section>
    `,
    data() {
        return {
            name: null,
            yob: null,
            gender: null,
        }
    },
    methods: {
       startTest() {
            var user = {
               name: this.name,
               yob: this.yob,
               gender: this.gender
           }
            surveyService.setUser(user);
            this.$router.push('/promo')
       }
    },
    created() {
        surveyService.initExp();
    }
}
