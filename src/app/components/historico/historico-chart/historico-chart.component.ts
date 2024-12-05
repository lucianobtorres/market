import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChartOptions, Chart } from "chart.js";
import { Observable } from 'rxjs';
import { PurchaseHistoryRecord } from '../historico.component';
import { BaseChartDirective } from 'ng2-charts';
import { MatTabChangeEvent } from '@angular/material/tabs';


export interface FormEdicaoInventory {
  nome: FormControl<string>;
}

@Component({
  selector: 'app-historico-chart',
  templateUrl: './historico-chart.component.html',
  styleUrls: ['./historico-chart.component.scss'],
})
export class HistoricoChartComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) baseChart: BaseChartDirective | undefined;

  @Input() records!: Observable<PurchaseHistoryRecord[]>;
  chartData: any[] = [];
  chartLabels: string[] = []; // Rótulos das datas
  chartOptions: ChartOptions = {
    responsive: true,
  };
  chartColors = [
    {
      borderColor: '#00b894',
      backgroundColor: '#00b89440',
      pointBackgroundColor: '#00b894',
      pointBorderColor: '#fff',
      fill: 'origin'
    }
  ];

  purchaseHistory: PurchaseHistoryRecord[] = [];

  ngOnInit() {
    this.records.subscribe((itens) => {
      this.purchaseHistory = itens;
      this.updateChartData();
      this.setupChartOptions();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.baseChart?.chart) {
        this.baseChart.chart.resize();
      }
    }, 0);
  }

  onTabChanged(_: MatTabChangeEvent): void {
    setTimeout(() => {
      if (this.baseChart?.chart) {
        this.baseChart.chart.resize();
      }
    }, 0);
  }

  mapToolTip = new Map<number, string>();
  @Output() openDetail = new EventEmitter<number>();
  updateChartData() {
    this.chartLabels = this.purchaseHistory.map((entry) => {
      const formattedDate =
        ` ${new Date(entry.dateCompleted).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit' })} ` +
        `${new Date(entry.dateCompleted).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

      this.mapToolTip.set(entry.dateCompleted.getTime(), formattedDate);
      return formattedDate;
    });
    this.chartData = [
      {
        data: this.purchaseHistory.map((entry) => entry.totalPrice),
        label: 'Valor por Compra',

        borderColor: '#00b894',
        backgroundColor: '#00b89440',
        pointBackgroundColor: '#00b894',
        pointBorderColor: '#fff',
        yAxisID: 'y',
        fill: false
      },
      {
        data: this.purchaseHistory.map((entry) => entry.qtdItens),
        label: 'Itens por Compra',
        type: 'bar',
        borderColor: '#00b894',
        backgroundColor: '#00b89440',
        pointBackgroundColor: '#00b894',
        pointBorderColor: '#fff',
        yAxisID: 'y1',
        fill: false
      },
    ];
  }

  setupChartOptions() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'category',
          labels: this.chartLabels,
          // ticks: {
          //   maxTicksLimit: 4 // Mostra no máximo 4 rótulos por vez
          // }
        },
        y: {
          beginAtZero: true,
          position: 'left',
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: {
            drawOnChartArea: false, // Não desenha a grid da segunda escala
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.datasetIndex !== 1) {
                return ` R$ ${(<number>context.raw).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`
              }
              else {
                return ` ${context.raw} itens`
              }
            },
          },
        },
      },
      elements: {
        line: { tension: 0.4 }, // Suaviza as linhas
      },
      interaction: {
        mode: 'index', // Garante que o hover funciona corretamente
        intersect: false
      },
      onClick: (event, elements) => {
        // Verifica se um elemento foi clicado
        if (elements.length > 0) {
          const index = elements[0].index; // Obtém o índice do dado clicado
          const datasetIndex = elements[0].datasetIndex; // Obtém o dataset clicado

          if (datasetIndex === 0) {
            // Abre o detalhe do item clicado
            const selectedDate = this.chartLabels[index];
            this.openDetails(selectedDate);
          }
        }
      },
    };
  }

  openDetails(date: string): void {
    console.log('date', date)
    const dateFilter = this.getDateFromMap(date);
    console.log('dateFilter', dateFilter)
    if (!dateFilter) return;

    const panelIndex = Array.from(this.purchaseHistory.values()).findIndex(item => item.dateCompleted.getTime() === dateFilter);
    console.log('panelIndex', panelIndex)

    if (panelIndex !== -1) {
      this.openDetail.emit(panelIndex);
    }
  }

  getDateFromMap(date: string) {
    for (const [key, value] of this.mapToolTip.entries()) {
      if (date === value) return key;
    }
    return undefined;
  }



  groupBy(period: string): void {
    let groupedData;

    if (period === 'semester') {
      groupedData = this.groupBySemester(this.purchaseHistory);
    }

    if (period === 'month') {
      groupedData = this.groupByMonth(this.purchaseHistory);
    }

    if (!groupedData || !this.baseChart || !this.baseChart.chart) return;

    console.log(groupedData)
    this.chartData = groupedData;
    this.chartLabels = groupedData.map(item => item.date);  // Atualiza os labels do gráfico
    this.baseChart.chart.update();
  }

  groupByMonth(data: any[]): any[] {
    const groupedData: any = {};

    this.purchaseHistory.forEach(item => {
      const month = new Date(item.dateCompleted).getMonth(); // Pega o mês (0-11)
      const year = new Date(item.dateCompleted).getFullYear(); // Pega o ano

      // Usa o formato 'YYYY-MM' como chave
      const key = `${year}-${month + 1}`;

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }

      groupedData[key] += item.totalPrice;
    });

    // Retorna o array agrupado
    return Object.keys(groupedData).map(key => {
      return {
        date: key,
        value: groupedData[key]
      };
    });
  }

  // Método para agrupar os dados por semestre
  groupBySemester(data: any[]): any[] {
    const groupedData: any = {};

    this.purchaseHistory.forEach(item => {
      const month = new Date(item.dateCompleted).getMonth();
      const year = new Date(item.dateCompleted).getFullYear();

      // Divida o ano em dois semestres
      const semester = month < 6 ? '1st Semester' : '2nd Semester';
      const key = `${year}-${semester}`;

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }

      groupedData[key] += item.totalPrice;
    });

    return Object.keys(groupedData).map(key => {
      return {
        date: key,
        value: groupedData[key]
      };
    });
  }
}
