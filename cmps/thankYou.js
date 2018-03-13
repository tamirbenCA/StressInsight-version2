import surveyService from '../services/surveyService.js' 

export default {
    template: `
    <section>
        <h1>תודה על השתתפותך בניסוי</h1>
        <router-link to='/' tag="button">נבדק חדש</router-link>
    </section>
    `,
    created() {
        if (!surveyService.isCurrUser()) {
            this.$router.push('/');
        }
    },
    mounted() {
        surveyService.saveSubject();
    }
}