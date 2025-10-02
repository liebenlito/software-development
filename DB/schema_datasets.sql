CREATE TABLE public.datasets (
	id serial4 NOT NULL,
	filename varchar(255) NOT NULL,
	n_rows int4 NOT NULL,
	n_cols int4 NOT NULL,
	numeric_columns jsonb NULL,
	stats jsonb NULL,
	created_at timestamptz DEFAULT now() NULL,
	categorical_columns jsonb NULL,
	stored_csv text NULL,
	preview_rows jsonb NULL,
	raw_data jsonb NULL,
	CONSTRAINT datasets_pkey PRIMARY KEY (id)
);
CREATE INDEX ix_public_datasets_id ON public.datasets USING btree (id);