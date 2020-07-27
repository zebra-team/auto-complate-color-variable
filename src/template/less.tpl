{{#imports}}
{{&.}}
{{/imports}}

{{basicLessSource}}

.add-prefix(@theme) {
    .eui-theme-@{theme} {
        {{colorLessSource}}
    }
}

.generator-themes(1);