import { Component, OnInit } from '@angular/core';

import { QuizService } from '../services/quiz.service';
import { HelperService } from '../services/helper.service';
import { Option, Question, Quiz, QuizConfig } from '../models/index';
import { $, $$ } from 'protractor';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  providers: [QuizService]
})
export class QuizComponent implements OnInit {

  color;
  isValid: boolean;
  correctAnswer = true;
  correctAnswers = [];
  results = [];
  correctCount = 0;
  quizes: any[];
  quiz: Quiz = new Quiz(null);
  mode = 'quiz';
  quizName: string;
  config: QuizConfig = {
    'allowBack': true,
    'allowReview': true,
    'autoMove': false,  // if true, it will move to next question automatically when answered.
    'duration': 3600,  // indicates the time (in secs) in which quiz needs to be completed. 0 means unlimited.
    'pageSize': 1,
    'requiredAll': false,  // indicates if you must answer all the questions before submitting.
    'richText': false,
    'shuffleQuestions': false,
    'shuffleOptions': false,
    'showClock': false,
    'showPager': true,
    'theme': 'none'
  };

  pager = {
    index: 0,
    size: 1,
    count: 1
  };
  timer: any = null;
  startTime: Date;
  endTime: Date;
  ellapsedTime = '00:00';
  duration = '';

  constructor(private quizService: QuizService) { }

  ngOnInit() {
    this.quizes = this.quizService.getAll();
    this.quizName = this.quizes[0].id;
    this.loadQuiz(this.quizName);
  }

  loadQuiz(quizName: string) {
    this.quizService.get(quizName).subscribe(res => {
      this.quiz = new Quiz(res);
      this.pager.count = this.quiz.questions.length;
      this.startTime = new Date();
      this.timer = setInterval(() => { this.tick(); }, 1000);
      this.duration = this.parseTime(this.config.duration);
    });
    this.mode = 'quiz';
  }

  tick() {
    const now = new Date();
    const diff = (now.getTime() - this.startTime.getTime()) / 1000;
    if (diff >= this.config.duration) {
      this.onSubmit();
    }
    this.ellapsedTime = this.parseTime(diff);
  }

  parseTime(totalSeconds: number) {
    let mins: string | number = Math.floor(totalSeconds / 60);
    let secs: string | number = Math.round(totalSeconds % 60);
    mins = (mins < 10 ? '0' : '') + mins;
    secs = (secs < 10 ? '0' : '') + secs;
    return `${mins}:${secs}`;
  }

  get filteredQuestions() {
    return (this.quiz.questions) ?
      this.quiz.questions.slice(this.pager.index, this.pager.index + this.pager.size) : [];
  }

  onSelect(question: Question, option: Option) {
    if (question.questionTypeId === 1) {
      question.options.forEach((x) => { if (x.id !== option.id) {x.selected = false; } });
    }

    if (this.config.autoMove) {
      this.goTo(this.pager.index + 1);
    }
  }

  goTo(index: number) {
    if (index >= 0 && index < this.pager.count) {
      this.pager.index = index;
      this.mode = 'quiz';
    }
  }

  isAnswered(question: Question) {
    return question.options.find(x => x.selected) ? 'Answered' : 'Not Answered';
  }

  isCorrect(question: Question) {
    return question.options.every(x => x.selected === x.isAnswer) ? 'correct' : 'wrong';
  }

  correctSelected(isAnswer: any, selected: any) {
    // let isAnswer;
    // let id;
    // question.options.every(x => (id = x.id));
    // question.options.every(x => (isAnswer = x.isAnswer));
    // // console.log(question.options.every(x => x.isAnswer === true) ? 'correct' : 'wrong');
        if (isAnswer && selected) {
          return 'alert-success';
        } else if (isAnswer === true && selected === false) {
          return 'alert-warning';
        } else if (isAnswer === false && selected === true) {
          return 'alert-danger';
        } else {
          return 'alert-default';
        }

    // console.log(test);
    // return question.options.every(x => x.isAnswer === this.correctAnswer) ? 'correct' : 'wrong';
  }

  onSubmit() {
    const answers = [];
    this.quiz.questions.forEach(x => answers.push({ 'quizId': this.quiz.id, 'questionId': x.id, 'answered': x.answered }));
    // Post your data to the server here. answers contains the questionId and the users' answer.
    console.log(this.quiz.questions);
    this.quiz.questions.forEach(x => this.results.push(this.isCorrect(x)));
    this.results.forEach((x) => {if (x === 'correct')  {this.correctCount = this.correctCount + 1; } }) ;
    console.log(this.results);
    this.mode = 'result';
  }

  getCorrectCount() {
    return this.correctCount;
  }

  getWrongCount() {
    return this.results.length - this.correctCount;
  }

  getCorrectPercentage() {
    const correctPercentage = this.correctCount / this.results.length * 100;
    return Math.round(correctPercentage);
  }

  setColor() {
    const value = this.getCorrectPercentage();
    if (value > 2) {
      this.isValid = true;
    } else {
      this.isValid = false ;
    }
  }

  selectColor() {
    const value = this.getCorrectPercentage();
    if (value > 2) {
      this.color = 'green';
    } else {
      this.color = 'red' ;
    }
  }

  clearAll() {
    this.correctCount = 0;
    this.correctAnswers = [];
    this.results = [];
    this.loadQuiz(this.quizName);
  }
}
