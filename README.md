# highcharts-realtime-plugin
O highcharts apresenta problemas de vazamento de memória e pode se tornar um gargalo em aplicações de dashboards realtime com muitos gráficos e séries que são atualizados constantemente com novos pontos. O plugin faz a atualização de todos os charts da página em round robin com um intervalo de tempo pré-determinado. Isso reduz bastante o consumo de CPU no cliente e permite que a interface mantenha-se responsiva mesmo com diversos gráficos com muitas séries e pontos. Além disso, recria os gráficos a cada N ciclos de redraw (configurável), mitigando assim os memory leaks do Highcharts. O plugin foi testado para um case de 10 charts com 10 séries de 1000 pontos cada, com stock chart.
