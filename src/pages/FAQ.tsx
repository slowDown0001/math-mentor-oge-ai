import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft, Plus, Minus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Часто задаваемые вопросы</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto p-6 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <HelpCircle className="w-16 h-16 text-primary" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-bold">?</span>
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Часто задаваемые вопросы (FAQ) о платформе Egechat
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Найдите ответы на популярные вопросы о нашей платформе подготовки к ОГЭ и ЕГЭ
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Что такое Egechat?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Egechat — это персональный аватар-наставник на основе искусственного интеллекта, который помогает подготовиться к экзаменам ОГЭ и ЕГЭ, особенно по математике. Это не просто чат, а полноценный цифровой репетитор, который выявляет пробелы в знаниях, составляет индивидуальный план обучения и подбирает задания в зависимости от уровня подготовки ученика.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Как проходит подготовка и практика на Egechat?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Главный принцип — это максимальная практика через персонализированный подход. Система анализирует каждое ваше действие (включая время, затраченное на решение) и на основе этих данных выстраивает траекторию обучения. Вы начинаете с простых задач, и по мере роста вашего мастерства уровень сложности плавно увеличивается. Это позволяет точечно закрывать пробелы в знаниях, начиная с тем за прошлые классы, и гарантирует устойчивое понимание материала.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Для каких экзаменов подходит Egechat?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Платформа Egechat создана для подготовки к экзаменам ОГЭ и ЕГЭ по математике — как к базовому, так и к профильному уровню. Благодаря гибкой системе, ученик с любым уровнем знаний может начать подготовку: от базовых заданий до самых сложных задач второй части экзамена.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Какие материалы доступны на Egechat?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  На платформе собраны все необходимые материалы для подготовки к экзаменам:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    полный банк заданий ФИПИ с решениями и ответами;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    более <strong>5000 авторских задач-клонов</strong>, позволяющих отработать каждую тему до автоматизма;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    <strong>2000 тренировочных заданий</strong> для постепенного погружения в тему;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    <strong>Обширные теоретические материалы и конспекты</strong>, структурированные по темам кодификатора ФИПИ;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    видеоуроки с пошаговыми объяснениями.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Можно ли решать задачи по фото или проверять свои решения?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Да, в Egechat можно загрузить фото задачи из учебника или скан варианта — система автоматически распознает условие и предоставит подробное решение. Также пользователь может сфотографировать собственное решение, и платформа проверит его корректность, выделив ошибки и объяснив, где именно они были допущены.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Есть ли возможность пройти тренировочный экзамен?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Да, Egechat позволяет проходить <strong>полноценные тренировочные экзамены</strong> на время, полностью имитирующие реальный формат ЕГЭ и ОГЭ: те же бланки, те же условия и ограничения по времени. После завершения экзамена ученик получает детальный разбор ошибок и рекомендации по улучшению результата.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Чем Egechat лучше обычного репетитора или онлайн-курсов?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Egechat отличается от репетитора и стандартных онлайн-курсов следующими преимуществами:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    доступен круглосуточно, без расписания и ограничений;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    полностью персонализирует программу, адаптируясь под ученика, чего не может сделать репетитор с группой или стандартный курс;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    анализирует каждую попытку и каждое действие студента;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    отвечает на вопросы мгновенно и в удобной форме;
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                    стоит всего <strong>999 ₽ в месяц</strong>, что значительно дешевле занятий с репетитором и онлайн-курсов.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Сколько стоит подписка на Egechat?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Первая неделя на платформе предоставляется <strong>бесплатно</strong>. Затем доступ ко всем функциям, включая учебные материалы, базу задач, видеокурсы и работу с AI-наставником, стоит <strong>999 ₽ в месяц</strong>. Оплата безопасна, подписку можно отменить в любой момент.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Подходит ли Egechat для начинающих и для сильных учеников?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Да, система подходит абсолютно для всех. Если у ученика есть пробелы в знаниях, Egechat начинает с основ и постепенно поднимает уровень. Для сильных учеников наставник предлагает сложные задания второй части экзамена, помогает отработать стратегию и тренирует в условиях реального экзамена.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Можно ли заниматься в любое время и с телефона?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Да, Egechat всегда под рукой. Достаточно иметь доступ в интернет, чтобы решать задачи, задавать вопросы, проверять свои решения или проходить пробные экзамены. Можно заниматься ночью, в дороге или в любое удобное время без привязки к расписанию.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="border rounded-lg px-6 bg-card shadow-sm">
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <h3 className="text-lg font-semibold">Есть ли у Egechat сообщество?</h3>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="text-muted-foreground leading-relaxed">
                  Да, кроме индивидуальной подготовки, пользователи могут присоединиться к комьюнити. Там можно обсуждать задачи с другими учениками, делиться лайфхаками, обмениваться опытом и даже просто снимать стресс через мемы и дружеское общение.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Остались вопросы?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Начните бесплатную неделю прямо сейчас и убедитесь сами в эффективности нашей платформы
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link to="/">
                Попробовать бесплатно
              </Link>
            </Button>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Что такое Egechat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Egechat — это персональный аватар-наставник на основе искусственного интеллекта, который помогает подготовиться к экзаменам ОГЭ и ЕГЭ, особенно по математике. Это не просто чат, а полноценный цифровой репетитор, который выявляет пробелы в знаниях, составляет индивидуальный план обучения и подбирает задания в зависимости от уровня подготовки ученика."
                }
              },
              {
                "@type": "Question",
                "name": "Как проходит подготовка и практика на Egechat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Главный принцип — это максимальная практика через персонализированный подход. Система анализирует каждое ваше действие (включая время, затраченное на решение) и на основе этих данных выстраивает траекторию обучения. Вы начинаете с простых задач, и по мере роста вашего мастерства уровень сложности плавно увеличивается. Это позволяет точечно закрывать пробелы в знаниях, начиная с тем за прошлые классы, и гарантирует устойчивое понимание материала."
                }
              },
              {
                "@type": "Question",
                "name": "Для каких экзаменов подходит Egechat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Платформа Egechat создана для подготовки к экзаменам ОГЭ и ЕГЭ по математике — как к базовому, так и к профильному уровню. Благодаря гибкой системе, ученик с любым уровнем знаний может начать подготовку: от базовых заданий до самых сложных задач второй части экзамена."
                }
              },
              {
                "@type": "Question",
                "name": "Какие материалы доступны на Egechat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "На платформе собраны все необходимые материалы для подготовки к экзаменам: полный банк заданий ФИПИ с решениями и ответами, более 5000 авторских задач-клонов, позволяющих отработать каждую тему до автоматизма, 2000 тренировочных заданий для постепенного погружения в тему, обширные теоретические материалы и конспекты, структурированные по темам кодификатора ФИПИ, а также видеоуроки с пошаговыми объяснениями."
                }
              },
              {
                "@type": "Question",
                "name": "Можно ли решать задачи по фото или проверять свои решения?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Да, в Egechat можно загрузить фото задачи из учебника или скан варианта — система автоматически распознает условие и предоставит подробное решение. Также пользователь может сфотографировать собственное решение, и искусственный интеллект проверит его корректность, выделив ошибки и объяснив, где именно они были допущены."
                }
              },
              {
                "@type": "Question",
                "name": "Есть ли возможность пройти тренировочный экзамен?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Да, Egechat позволяет проходить полноценные тренировочные экзамены на время, полностью имитирующие реальный формат ЕГЭ и ОГЭ: те же бланки, те же условия и ограничения по времени. После завершения экзамена ученик получает детальный разбор ошибок и рекомендации по улучшению результата."
                }
              },
              {
                "@type": "Question",
                "name": "Чем Egechat лучше обычного репетитора или онлайн-курсов?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Egechat отличается от репетитора и стандартных онлайн-курсов следующими преимуществами: доступен круглосуточно, без расписания и ограничений; полностью персонализирует программу, адаптируясь под ученика, чего не может сделать репетитор с группой или стандартный курс; анализирует каждую попытку и каждое действие студента; отвечает на вопросы мгновенно и в удобной форме; стоит всего 999 ₽ в месяц, что значительно дешевле занятий с репетитором и онлайн-курсов."
                }
              },
              {
                "@type": "Question",
                "name": "Сколько стоит подписка на Egechat?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Первая неделя на платформе предоставляется бесплатно. Затем доступ ко всем функциям, включая учебные материалы, базу задач, видеокурсы и работу с AI-наставником, стоит 999 ₽ в месяц. Оплата безопасна, подписку можно отменить в любой момент."
                }
              },
              {
                "@type": "Question",
                "name": "Подходит ли Egechat для начинающих и для сильных учеников?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Да, система подходит абсолютно для всех. Если у ученика есть пробелы в знаниях, Egechat начинает с основ и постепенно поднимает уровень. Для сильных учеников наставник предлагает сложные задания второй части экзамена, помогает отработать стратегию и тренирует в условиях реального экзамена."
                }
              },
              {
                "@type": "Question",
                "name": "Можно ли заниматься в любое время и с телефона?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Да, Egechat всегда под рукой. Достаточно иметь доступ в интернет, чтобы решать задачи, задавать вопросы, проверять свои решения или проходить пробные экзамены. Можно заниматься ночью, в дороге или в любое удобное время без привязки к расписанию."
                }
              },
              {
                "@type": "Question",
                "name": "Есть ли у Egechat сообщество?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Да, кроме индивидуальной подготовки, пользователи могут присоединиться к комьюнити. Там можно обсуждать задачи с другими учениками, делиться лайфхаками, обмениваться опытом и даже просто снимать стресс через мемы и дружеское общение."
                }
              }
            ]
          })
        }} />
      </main>
    </div>
  );
}