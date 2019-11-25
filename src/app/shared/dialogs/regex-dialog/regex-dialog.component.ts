import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'b2b-regex-dialog',
  templateUrl: 'regex-dialog.component.html',
  styleUrls: ['./regex-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegexDialogComponent implements OnInit {
  ruleBeginings = [
    {
      id: 1,
      title: 'Начало строки'
    },
    {
      id: 2,
      title: 'Конец строки'
    },
    {
      id: 3,
      title: 'До'
    },
    {
      id: 4,
      title: 'После'
    }
  ];

  regexRulings = [
    {
      id: 1,
      title: 'Цифры'
    },
    {
      id: 2,
      title: 'Кириллица'
    },
    {
      id: 3,
      title: 'Англ. буквы'
    },
    {
      id: 4,
      title: 'Пробел'
    },
    {
      id: 5,
      title: 'Символ(-ы)'
    }
  ];

  rules: any[] = [];
  previewData: any[] = [];
  leftToDo: any[] = [];

  regexStringExample = '';
  regexApplyExample = '';

  constructor(public dialogRef: MatDialogRef<RegexDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    this.rules = this.data.rules ? JSON.parse(JSON.stringify(this.data.rules)) : [];
    this.previewData = this.data.valuesStat;
    this.leftToDo = this.previewData.filter(value => value.indexOf('span') > 0);
    this.changePreview();
  }

  onAddRule() {
    this.rules.push({
      begining: null,
      string: '',
      rulings: [],
      active: false
    });
  }

  onAddRuling(rule) {
    rule.rulings.push({
      ruling: null,
      number: null,
      optional: false,
      active: false
    });
  }

  onCancelRule(index) {
    this.rules.splice(index, 1);
    this.changePreview();
  }

  onCancelRuling(rule, index) {
    rule.rulings.splice(index, 1);
    this.changePreview();
  }

  onApplyClick(): void {
    this.dialogRef.close({ rules: this.rules, regex: this.generateRegex().filter(line => line)
                                                         .map(regex => new RegExp(regex, 'i').toString()) });
  }

  getRuleColor(index: number, active = true) {
    const ruleClass = getRuleClass(index);
    return { [ruleClass]: active };
  }

  getRuleColorForWrap(index: number, active = true) {
    const ruleClass = getRuleClassWrap(index);
    return { [ruleClass]: active };
  }

  changePreview() {
    this.regexApplyExample = this.applyPreviewToLine(this.regexStringExample, this.generateRegex());
    this.previewData = this.data.valuesStat.map(value => {
      return this.applyPreviewToLine(value, this.generateRegex());
    });
    this.leftToDo = this.previewData.filter(value => value.indexOf('span') > 0);
  }

  applyPreviewToLine(string: string, regexLines: string[]): string {
    regexLines.forEach((line, i) => {
      if (line) {
        const reg = new RegExp(line, 'i');
        const num_groups = (new RegExp(reg.toString() + '|')).exec('').length - 1;
        const selectedGroups = [];
        const tempString = string;
        let match = '';
        let replacedMatch = '';

        if (num_groups) {
          tempString.replace(reg, function replacer() {
            match = replacedMatch = arguments[0];
            for (let fori = 1; fori <= num_groups; fori++) {
              if (arguments[fori]) {
                selectedGroups.push(arguments[fori]);
              }
            }
            return string;
          });
          selectedGroups.forEach(group => {
            replacedMatch = replacedMatch.replace(group, wrapPreviewLine(group, i));
          });
          string = string.replace(match, replacedMatch);
          string = string.replace(new RegExp('REPLACESPACEHERE', 'g'), ' ');
        }
      }
    });
    return string;
  }

  generateRegex() {
    const regexLines = this.rules.map(rule => {
      let regexLine = '';
      if (rule.active) {
        const begining = rule.begining ? rule.begining.id : null;
        const rulingsArray = [ ...rule.rulings ];

        if (begining === 1) {
          regexLine += '^';
        }
        if (begining === 4) {
          regexLine += `${rule.string}`;
        }
        if (begining === 2) {
          rulingsArray.reverse();
        }

        rulingsArray.filter(ruling => ruling.ruling).forEach(ruling => {
          const rulingId = ruling.ruling.id;
          let regexLineAddition = '';
          if (rulingId === 1) {
            regexLineAddition = `\\d${ruling.number ? '{' + ruling.number + '}' : `${ruling.optional ? '*' : '+'}`}`;
          } else if (rulingId === 2) {
            regexLineAddition = `[а-яА-Я]${ruling.number ? '{' + ruling.number + '}' : `${ruling.optional ? '*' : '+'}`}`;
          } else if (rulingId === 3) {
            regexLineAddition = `[a-zA-Z]${ruling.number ? '{' + ruling.number + '}' : `${ruling.optional ? '*' : '+'}`}`;
          } else if (rulingId === 4) {
            regexLineAddition = `\\s${ruling.number ? '{' + ruling.number + '}' : `${ruling.optional ? '*' : '+'}`}`;
          } else if (rulingId === 5) {
            regexLineAddition = `[-!$%^&*()_+|~={};'?,.]${ruling.number ? '{' + ruling.number + '}' : `${ruling.optional ? '*' : '+'}`}`;
          }
          regexLine += `${ruling.active ? '(' : ''}${regexLineAddition}`;
          regexLine += `${ruling.optional ? '?' : ''}${ruling.active ? ')' : ''}`;
        });

        if (begining === 2) {
          regexLine += '$';
        }
        if (begining === 3) {
          regexLine += `${rule.string}`;
        }
      }

      return regexLine;
    });
    return regexLines;
  }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.title === c2.title : c1 === c2;
  }
}

function wrapPreviewLine(string: string, index: number): string {
  return `<spanREPLACESPACEHEREclass="${getRuleClass(index)}">${string}</span>`;
}

function getRuleClass(index: number) {
  return index === 0 ? 'rule-one' :
         index === 1 ? 'rule-two' :
         index === 2 ? 'rule-three' :
         index === 3 ? 'rule-four' : 'rule-five';
}

function getRuleClassWrap(index: number) {
  return index === 0 ? 'rule-one-wrap' :
         index === 1 ? 'rule-two-wrap' :
         index === 2 ? 'rule-three-wrap' :
         index === 3 ? 'rule-four-wrap' : 'rule-five-wrap';
}
